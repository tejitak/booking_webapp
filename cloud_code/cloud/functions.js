var _ = require('underscore')
var util = require('cloud/util')
var resourceBundle = require('cloud/resourceBundle')

var Restaurant = Parse.Object.extend("Restaurant");
var Photo = Parse.Object.extend("Photo");
var Activity = Parse.Object.extend("Activity");

var buildMyActivityQuery = function(userId, params) {
  params = params || {}
  var query = new Parse.Query(Activity);
  query.equalTo("type", "LIKE");
  query.equalTo("from", {"__type": "Pointer", "className": "_User", "objectId": userId});
  // for mypage
  if (params.include) {
    query.include(params.include)
  }
  if (params.photoId) {
    query.equalTo("like_to", {"__type": "Pointer", "className": "Photo", "objectId": params.photoId});
  }
  if (params.restaurantId) {
    query.equalTo("from", {"__type": "Pointer", "className": "_User", "objectId": userId});
    query.equalTo("type", "LIKE");
    // create sub query for photo.restaurant
    var inQuery = new Parse.Query(Photo)
    inQuery.equalTo("restaurant", {"__type": "Pointer", "className": "Restaurant", "objectId": params.restaurantId})
    query.matchesQuery('like_to', inQuery)
  }
  // sort by created order for mypage
  query.descending('createdAt')
  return query
}

var buildInstagramerPhotosQuery = function(userId, params) {
  params = params || {}
  var query = new Parse.Query(Photo);
  query.equalTo("instagramer", {"__type": "Pointer", "className": "Instagramer", "objectId": userId});
  // for mypage
  query.include("restaurant")
  // sort by instagram photo created time
  query.descending('media_created_time')
  return query
}

// FIXME: call REST API instead of JS SDK because blank resturant.photos entry will cause an error in toPointer due to no object id
var fetchRestaurants = function(params, debugParams, tags) {
  var promise = new Parse.Promise();
  Parse._request('GET', 'classes/Restaurant/' + util.paramToUrl(params))
    .then(function(result) {
      // default remove face photos
      var scanResultfilter = debugParams && debugParams.scan_result_filter || 'face'
      // when search tags are specified, remove the filter
      if (tags) {
        scanResultfilter = ''
      }
      result.results.forEach(function(restaurant) {
        util.pruneRestaurantPhotos(restaurant, scanResultfilter)
      })
      promise.resolve(result.results)
    }, function(err) {
      promise.reject(err)
    })
  return promise
}

var fetchRestaurant = function(restaurantId, params) {
  var promise = new Parse.Promise();
  Parse._request('GET', 'classes/Restaurant/' + restaurantId + util.paramToUrl(params))
    .then(function(result) {
      // WORKAROUND: patch to filter out blank pointers
      util.pruneRestaurantPhotos(result, null)
      promise.resolve(result)
    }, function(err) {
      promise.reject(err)
    })
  return promise
}

var fetchPhotos = function(params) {
  var promise = new Parse.Promise()
  Parse._request('GET', 'classes/Photo/' + util.paramToUrl(params))
    .then(function(result) {
      // allow the object as PFObject in iOS
      result.results.forEach(function(photo) {
        photo.__type = 'Object'
        photo.className = 'Photo'
      })
      promise.resolve(result.results)
    }, function(err) {
      promise.reject(err)
    })
  return promise
}

var fetchPhoto = function(photoId, params) {
  return Parse._request('GET', 'classes/Photo/' + photoId + util.paramToUrl(params))
}

var fetchInstagramer = function(userId) {
  return Parse._request('GET', 'classes/Instagramer/' + userId)
}

var fetchSuggestions = function(params) {
  var promise = new Parse.Promise();
  if (params.type === 'Instagramer') {
    var restParams = {
      order: '-followed_by_count',
      limit: 20,
      where: JSON.stringify({
        "$or": [
          {username: {'$regex': params.keyword, '$options':'i'}},
          {full_name: {'$regex': params.keyword, '$options':'i'}}
        ]
      })
    }
    Parse._request('GET', 'classes/Instagramer/' + util.paramToUrl(restParams))
    .then(function(result) {
      // create type common name and description
      result.results.forEach(function(entry) {
        entry.type = params.type
        entry.name = entry.username
        entry.description = entry.full_name
      })
      promise.resolve(result.results)
    }, function(err) {
      promise.reject(err)
    })
  } else {
    var where = {
      name: {'$regex': params.keyword, '$options':'i'}
    }
    if (params.type) {
      where.type = params.type
    }
    var restParams = {
      order: '-post_count',
      limit: 20,
      where: JSON.stringify(where)
    }
    Parse._request('GET', 'classes/Suggestion/' + util.paramToUrl(restParams))
    .then(function(result) {
      // create type common name and description
      result.results.forEach(function(entry) {
        entry.value = entry.name
        if (entry.type === 'Tag') {
          entry.name = '#' + entry.name
        }
        entry.description = util.numberFormat(entry.post_count) + ' posts'
      })
      promise.resolve(result.results)
    }, function(err) {
      promise.reject(err)
    })
  }
  return promise
}

var fetchActivities = function(userId, params) {
  var promise = new Parse.Promise();
  var query = buildMyActivityQuery(userId, params)
  query.find().then(function(likeModels) {
    promise.resolve(likeModels);
  }, function(err) {
    console.log('error on fetchActivities')
    console.log(JSON.stringify(arguments[0]))
    console.log(JSON.stringify(arguments[1]))
    promise.reject(err)
  })
  return promise
}

// limit: Number (e.g. 40, default 20)
// skip: Number (e.g. 20, default 0)
// order: String (e.g. “-rating” for rating descending)
// tags: String (e.g. “Sushi”)
// price_lunch_low: Number (e.g. 1000)
// price_lunch_high: Number (e.g. 2000)
// price_dinner_low: Number (e.g. 4000)
// price_dinner_high: Number (e.g. 5000)
// near: GeoObject (e.g.　{"__type":"GeoPoint","latitude":35.65136410115621,"longitude":139.69784146557618})
// box: [GeoObject, GeoObject]
// (optional) currentGeo
var paramToRest = function(params) {
  var restJson = {
    limit: params.limit || 20,
    skip: params.skip || 0
  }
  if (params.order && params.order !== '$near') {
    restJson.order = params.order
  }
  // convert cloud code API params to Parse REST API params
  var where = {}
  try {
    // TODO: to be removed
    if (params.area) {
      where["area"] = params.area
    }
    if (params.tags) {
      where['tags'] = params.tags
    }
    if (params.price_lunch_low) {
      where["has_lunch"] = true
      where["price_lunch_low"] = {"$gte": params.price_lunch_low}
    }
    if (params.price_lunch_high) {
      where["has_lunch"] = true
      where["price_lunch_low"] = {"$lte": params.price_lunch_high}
    }
    if (params.price_dinner_low) {
      where["has_dinner"] = true
      where["price_dinner_low"] = {"$gte": params.price_dinner_low}
    }
    if (params.price_dinner_high) {
      where["has_dinner"] = true
      where["price_dinner_low"] = {"$lte": params.price_dinner_high}
    }
    if (params.box) {
      where["geo"] = {"$within":{"$box": params.box}}
    } else if (params.near) {
      where["geo"] = {
        "$nearSphere": params.near,
        "$maxDistanceInKilometers": params.maxDistanceInKilometers || 20.0
      }
    }
    if (params.scan_result) {
      where["scan_result"] = params.scan_result
    }
  } catch (e) {
    console.log('query parse error: ' + JSON.stringify(e))
  }
  restJson.where = JSON.stringify(where)
  return restJson
}

var functions = {
  debug: function(request, response) {
    console.log('debug log');
    console.log(JSON.stringify(request.params));
    response.success(request.params);
  },

  // shuffled photos for top list / map views by restaurants
  photo_list: function(request, response) {
    // for screen capture demo
    if (request.params.demo) {
      return response.success(require('cloud/data/demo_list'))
    }
    // redirect to popular photo API
    if (request.params.order === "-like_count") {
      functions.popular_photos(request, response)
    } else {
      // setup params
      var params = paramToRest(request.params)
      params.include = 'photos'
      params.keys = 'photos,geo,name_ja,name_en,open_hours,shop_holidays'
      var promises = []
      promises.push(fetchRestaurants(params, request.params.debugParams, request.params.tags));
      // retrieve my likes when user is logged in
      if (request.user) {
        promises.push(fetchActivities(request.user.id));
      }
      Parse.Promise.when(promises).then(function(restaurants, likeModels) {
        var where = {}
        try { where = JSON.parse(params.where) } catch(e) {}
        // check currentGeo to calculate distance, use currentGeo param or get from near query
        var currentGeo = request.params.currentGeo;
        restaurants.forEach(function(restaurant) {
          // add displayed open now
          util.updateOpenNow(restaurant, restaurant.photos, request.params.timezoneOffset)
          // modify photo -> restaurant pointer for iOS
          util.modifyPhotoRestaurantPointer(restaurant)
        })
        // shuffle photos from restaurants
        var photos = util.generateRandomRestaurantPhotos(restaurants, where.tags)
        // add distance to photos
        util.addDistanceProps(null, photos, currentGeo)
        var result = {
          hasNext: restaurants.length >= params.limit,
          photos: photos
        };
        // merge my likes into photos
        if (likeModels) {
          util.mergeLikedByMeToPhotos(photos, likeModels)
        }
        response.success(result);
      }, function(err) {
        response.error(err)
      })
    }
  },

  popular_photos: function(request, response) {
    // TODO: TEMP WORKAROUND to avoid slow response
    delete request.params.near
    // TEMP: show only food photos for 1st release
    request.params.scan_result = {'$ne': 'face'}
    // setup params
    var params = paramToRest(request.params)
    params.include = 'restaurant'
    var promises = []
    promises.push(fetchPhotos(params));
    // retrieve my likes when user is logged in
    if (request.user) {
      promises.push(fetchActivities(request.user.id));
    }
    Parse.Promise.when(promises).then(function(photos, likeModels) {
      var where = {}
      try { where = JSON.parse(params.where) } catch(e) {}
      // check currentGeo to calculate distance, use currentGeo param or get from near query
      var currentGeo = request.params.currentGeo;
      photos.forEach(function(photo) {
        // add displayed open now
        util.updateOpenNow(photo.restaurant, [photo], request.params.timezoneOffset)
        // remove restaurant props for consistency
        photo.restaurant = {
          name_en: photo.restaurant.name_en,
          name_ja: photo.restaurant.name_ja,
          objectId: photo.restaurant.objectId
        }
      })
      // add distance to photos
      util.addDistanceProps(null, photos, currentGeo)
      var result = {
        hasNext: photos.length >= params.limit,
        photos: photos
      };
      // merge my likes into photos
      if (likeModels) {
        util.mergeLikedByMeToPhotos(photos, likeModels)
      }
      response.success(result);
    }, function(err) {
      response.error(err)
    })
  },

  restaurant_detail: function(request, response) {
    // for screen capture demo
    if (request.params.demo) {
      return response.success(require('cloud/data/demo_restaurant_detail_' + resourceBundle.getLocale(request)))
    }
    var params = request.params
    if (!params || !params.restaurantId) {
      return response.error('restaurantId is required')
    }
    var queryParams = {include: 'photos'}
    var promises = []
    promises.push(fetchRestaurant(params.restaurantId, queryParams));
    // retrieve my likes when user is logged in
    if (request.user) {
      promises.push(fetchActivities(request.user.id, {restaurantId: params.restaurantId}));
    }
    Parse.Promise.when(promises).then(function(restaurant, likeModels) {
      // add distance to restaurant object
      if (params.currentGeo) {
        util.addDistanceProps(restaurant, restaurant.photos, params.currentGeo)
      }
      var labels = resourceBundle.getLabels(request)
      // add displayed address label into restaurant
      restaurant.location.displayed_address = util.displayedAddress(restaurant.location, resourceBundle.getLocale(request), labels)
      // add displayed open hours
      restaurant.displayed_open_hours = util.displayOpenHours(restaurant.open_hours, restaurant.shop_holidays, params.timezoneOffset, labels)
      restaurant.displayed_budgets = util.displaybudgets(restaurant.budget, labels)
      restaurant.displayed_shop_holidays = util.displayShopHolidays(restaurant.shop_holidays, labels)
      restaurant.displayed_cards = util.displayCards(restaurant.card, labels)
      restaurant.displayed_smoking = util.displaySmoking(restaurant.facility.smoking_availability, labels)
      restaurant.displayed_number_of_seats = util.displayNumberOfSeats(restaurant.facility.number_of_seats, labels)
      // add displayed open now
      util.updateOpenNow(restaurant, restaurant.photos, params.timezoneOffset)
      // modify photo -> restaurant pointer for iOS
      util.modifyPhotoRestaurantPointer(restaurant)
      // copy distance and open now information
      restaurant.photos.forEach(function(photo) {
        photo.distance = restaurant.distance
      })
      // merge my likes into photos
      if (likeModels) {
        util.mergeLikedByMeToPhotos(restaurant.photos, likeModels)
      }
      response.success(restaurant);
    }, function(err) {
      response.error(err)
    })
  },

  photo_detail: function(request, response) {
    var params = request.params
    if (!params || !params.photoId) {
      return response.error('photoId is required')
    }
    var promises = []
    promises.push(fetchPhoto(params.photoId, {include: 'restaurant'}));
    // retrieve my likes when user is logged in
    if (request.user) {
      promises.push(fetchActivities(request.user.id, {photoId: params.photoId}));
    }
    Parse.Promise.when(promises).then(function(photo, likeModels) {
      // add displayed open now
      util.updateOpenNow(photo.restaurant, [photo], request.params.timezoneOffset)
      // merge my likes into photos
      if (likeModels) {
        util.mergeLikedByMeToPhotos([photo], likeModels)
      }
      response.success(photo);
    }, function(err) {
      response.error(err)
    })
  },

  suggestions: function(request, response) {
    var params = request.params
    if (!params || !params.keyword) {
      return response.error('keyword is required')
    }
    fetchSuggestions(params).then(function(suggestions) {
      response.success(suggestions);
    }, function(err) {
      response.error(err)
    })
  },

  instagramer_page: function(request, response) {
    var params = request.params
    if (!params || !params.instagramerId) {
      return response.error('instagramerId is required')
    }
    var promises = []
    // fetch instagramer information
    promises.push(fetchInstagramer(params.instagramerId))
    // fetch instagramer photos
    promises.push(buildInstagramerPhotosQuery(params.instagramerId).find());
    // retrieve my likes when user is logged in
    if (request.user) {
      promises.push(fetchActivities(request.user.id));
    }
    Parse.Promise.when(promises).then(function(instagramer, photoModels, likeModels) {
      var photos = util.arrayToJSON(photoModels)
      // merge my likes into photos
      if (likeModels) {
        util.mergeLikedByMeToPhotos(photos, likeModels)
      }
      // convert photos to restaurant top level array
      var restaurants = util.convertPhotosToRestaurantAxis(photos)
      // delete unnecessary restaurant entry and set pointer for reducing response size
      restaurants.forEach(function(restaurant) {
        // add distance to restaurant object
        var currentLocation = request.params.currentGeo
        if (currentLocation) {
          util.addDistanceProps(restaurant, restaurant.photos, currentLocation)
        }
        // add displayed open now
        util.updateOpenNow(restaurant, restaurant.photos, request.params.timezoneOffset)
        // modify photo -> restaurant pointer for iOS
        util.modifyPhotoRestaurantPointer(restaurant)
      })
      response.success({
        instagramer: instagramer,
        restaurants: restaurants,
        latest_photo: photos[0]
      });
    }, function(err) {
      response.error(err)
    })
  },

  mypage: function(request, response) {
    // for screen capture demo
    if (request.params.demo) {
      return response.success(require('cloud/data/demo_mypage'))
    }
    // user must be authenticated
    if (request.user) {
      var query = buildMyActivityQuery(request.user.id, {
        include: 'like_to.restaurant'
      })
      // retrieve own activities including photos and photos.restaurant
      query.find().then(function(likeModels) {
        var likes = util.arrayToJSON(likeModels)
        var photos = _.flatten(_.pluck(likes, "like_to"))
        // merge my likes into photos
        var likedPhotoCount = util.mergeLikedByMeToPhotos(photos, likeModels)
        // convert photos to restaurant top level array
        var restaurants = util.convertPhotosToRestaurantAxis(photos)
        // delete unnecessary restaurant entry and set pointer for reducing response size
        restaurants.forEach(function(restaurant) {
          // add distance to restaurant object
          var currentLocation = request.params.currentGeo
          if (currentLocation) {
            util.addDistanceProps(restaurant, restaurant.photos, currentLocation)
          }
          // add displayed open now
          util.updateOpenNow(restaurant, restaurant.photos, request.params.timezoneOffset)
          // modify photo -> restaurant pointer for iOS
          util.modifyPhotoRestaurantPointer(restaurant)
        })
        response.success({
          me: request.user,
          restaurants: restaurants,
          likedPhotoCount: likedPhotoCount
        });
      }, function(err) {
        response.error(err);
      });
    } else {
      return response.error({status: 403, message: "Not logged in."});
    }
  },

  like: function(request, response) {
    // user must be authenticated
    if (request.user) {
      // validate by checking existing entries
      var query = buildMyActivityQuery(request.user.id, {
        photoId: request.params.photoId
      })
      query.count().then(function(count) {
        if (count > 0) {
          // Duplicate found, abort the query here
          response.error({status: 400, message: "This user has already liked this photo"});
        } else {
          // No duplicate was found so proceed saving as a new data
          // ACL will be added by before trigger
          // set from & like_to value by current logged in user
          var activity = new Activity();
          activity.set("type", "LIKE");
          activity.set("from", {"__type": "Pointer", "className": "_User", "objectId": request.user.id});
          activity.set("like_to", {"__type": "Pointer", "className": "Photo", "objectId": request.params.photoId});
          activity.save(null, {
            success: function(activity) {
              response.success(activity);
            },
            error: function(activity, err) {
              response.error(err);
            }
          });
        } 
      }, function(err) {
        response.error(err);
      });
    } else {
      return response.error({status: 403, message: "Not logged in."});
    }
  },

  unlike: function(request, response) {
    // user must be authenticated
    if (request.user) {
      // find an activity by me
      var query = buildMyActivityQuery(request.user.id, {
        photoId: request.params.photoId
      })
      query.find().then(function(results) {
        if (results.length > 0) {
          // Target activity is found, proceed with the activityId
          results[0].destroy().then(function() {
            response.success(results[0]);
          }, function(err) {
            response.error(err);
          })
        } else {
          response.error({status: 400, message: "This user has not yet liked this photo"});
        }
      },
      function(err) {
        response.error(err);
      });
    } else {
      return response.error({status: 403, message: "Not logged in."});
    }
  }
};

module.exports.init = function() {
  for (var name in functions) {
    if (name && functions[name]) {
      Parse.Cloud.define(name, functions[name]);
    }
  }
};