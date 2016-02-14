var _ = require('underscore')
var constants = require('cloud/constants')

var util = {

  numberFormat: function(num) {
    // toLocalString does not supported by safari
    var numStr = String(num), prefix = ''
    if (numStr[0] === '-') {
      prefix = '-'
      numStr = numStr.slice(1, numStr.length)
    }
    return prefix + numStr.split("").reverse().join("").match(/\d{1,3}/g).join(",").split("").reverse().join("")
  },

  arrayToJSON: function(models) {
    return _.map(models, function(model) {
      return model.toJSON()
    })
  },

  paramToUrl: function(params) {
    var paramArr = []
    for (var name in params) {
      if (name && params[name]) {
        paramArr.push(name + '=' + encodeURIComponent(params[name]))
      }
    }
    return (paramArr.length > 0 ? '?' : '') + paramArr.join('&')
  },

  pruneRestaurantPhotos: function(restaurant, scanResultFilter) {
    // check with instagram_id sometimes pointer reference expansion is failed
    restaurant.photos = _.filter(restaurant.photos, function(photo) {
      if (scanResultFilter) {
        return photo.instagram_id && photo.scan_result !== scanResultFilter
      } else {
        return photo.instagram_id
      }
    })
  },

  modifyPhotoRestaurantPointer: function(restaurant) {
    restaurant.photos.forEach(function(photo) {
      // TEMP: to be removed after photo object has a distance
      photo.geo = restaurant.geo
      // remove __type class reference and set restaurant name for handling in iOS
      photo.restaurant = {
        objectId: restaurant.objectId,
        name_ja: restaurant['name_ja'],
        name_en: restaurant['name_en']
      }
    })
  },

  generateRandomRestaurantPhotos: function(restaurants, tag) {
    var list = []
    // select two photos by random on each restaurant
    restaurants.forEach(function(restaurant) {
      // show restaurant which has at most two photos
      var photos = restaurant.photos,
        count = 0
      while (photos.length > 0 && count < 1) {
        // generate random
        var ran = Math.floor(Math.random() * photos.length)
        var photo = photos.splice(ran, 1)[0]
        // filter only containing tag when tag is specified
        if (tag && photo.tags && photo.tags.indexOf(tag) === -1) {
          continue
        }
        list.push(photo)
        count++
      }
    })
    var shuffledArr = util.shuffle(list);
    // prevent showing odd, adjust the item length to even
    if (shuffledArr.length > 0 && shuffledArr.length % 2 === 1) {
      shuffledArr.splice(shuffledArr.length - 1, 1)
    }
    return shuffledArr
  },

  // return restaruants level photos from photo.restaurant for mypage and user page
  convertPhotosToRestaurantAxis: function(photos) {
    var restaurants = []
    photos.forEach(function(photo) {
      var restaurant = photo.restaurant
      var existingRestaurant = _.detect(restaurants, function(item){ return item.objectId === restaurant.objectId });
      // add new property
      if (!existingRestaurant) {
        // remove original photo reference
        restaurant.photos = []
        restaurants.push(restaurant)
        existingRestaurant = restaurant
      }
      existingRestaurant.photos.push(photo)
    })
    return restaurants
  },

  addDistanceProps: function(restaurant, photos, currentLocation) {
    // assign distance property to each photo, calculate distance between photo.restaurant and currentLocation
    if (restaurant) {
      restaurant.distance = util.getDistance(restaurant.geo, currentLocation)
    }
    if (photos) {
      photos.forEach(function(photo) {
        photo.distance = util.getDistance(photo.geo, currentLocation)
      })
    }
  },

  getDistance: function(loc1, loc2, precision) {
    if (!loc1 || !loc2) {
      return null
    }
    var lat1 = loc1.latitude,
      lng1 = loc1.longitude,
      lat2 = loc2.latitude,
      lng2 = loc2.longitude,
      distance = 0
    precision = precision || 1
    if ((Math.abs(lat1 - lat2) < 0.00001) && (Math.abs(lng1 - lng2) < 0.00001)) {
      distance = 0
    } else {
      lat1 = lat1 * Math.PI / 180
      lng1 = lng1 * Math.PI / 180
      lat2 = lat2 * Math.PI / 180
      lng2 = lng2 * Math.PI / 180
      var A = 6378140
      var B = 6356755
      var F = (A - B) / A
      var P1 = Math.atan((B / A) * Math.tan(lat1))
      var P2 = Math.atan((B / A) * Math.tan(lat2))
      var X = Math.acos(Math.sin(P1) * Math.sin(P2) + Math.cos(P1) * Math.cos(P2) * Math.cos(lng1 - lng2))
      var L = (F / 8) * ((Math.sin(X) - X) * Math.pow((Math.sin(P1) + Math.sin(P2)), 2) / Math.pow(Math.cos(X / 2), 2) - (Math.sin(X) - X) * Math.pow(Math.sin(P1) - Math.sin(P2), 2) / Math.pow(Math.sin(X), 2))
      distance = A * (X + L)
      var decimal_no = Math.pow(10, precision)
      distance = Math.round(decimal_no * distance / 1) / decimal_no
    }
    // meter
    return util.displayKmDistance(distance)
  },

  // convert meter to km with rounded
  displayKmDistance: function(distanceNum) {
    if (distanceNum === undefined || distanceNum === null) {
        return ''
    }
    distanceNum = distanceNum / 100
    distanceNum = Math.round(distanceNum) * 100
    if (distanceNum < 100) {
        return '0km'
    }
    return (distanceNum / 1000) + 'km'
  },

  shuffle: function(array) {
    var n = array.length, t, i
    while (n) {
      i = Math.floor(Math.random() * n--)
      t = array[n]
      array[n] = array[i]
      array[i] = t
    }
    return array
  },

  mergeLikedByMeToPhotos: function(photos, likeModels) {
    var count = 0
    photos.forEach(function(photo) {
      var match = false
      for (var i=0; i<likeModels.length; i++) {
        if (photo.objectId === likeModels[i].get('like_to').id) {
          match = true
          count++
          break
        }
      }
      photo.likedByMe = match
    })
    return count
  },

  displayedAddress: function(location, locale, labels) {
    var arr = []
    // handling address2 for ja missing but exists in en https://github.com/Indie-Inc/hashdish_ios/issues/77
    var address2 = location['address2_' + locale]
    if (address2) {
      arr.push(address2)
    }
    var address1 = location['address1_' + locale]
    if (address1) {
      arr.push(address1)
    }
    if (!address2 && !address1) {
      address2 = location['address2_en']
      if (address2) {
        arr.push(address2)
      }
      address1 = location['address1_en']
      if (address1) {
        arr.push(address1)
      }
    }
    var locality = util.localizeProp(location, 'locality', locale)
    if (locality) {
      arr.push(locality)
    }
    var region = util.localizeRegion(location, labels)
    if (region) {
      arr.push(region)
    }
    // reverse array for Japanese
    if (locale === 'ja') {
      arr.reverse()
    }
    return arr.join(' ')
  },

  localizeProp: function(obj, prop, locale) {
    // e.g. prop: name & locale: ja -> obj['name_ja'] 
    // if no appropriate prop exist, fallback to English
    return obj[prop + '_' + locale] || obj[prop + '_en'] || obj[prop] || ''
  },

  localizeRegion: function(location, labels) {
    if (!location) { return '' }
    return labels['constants_area_' + location.country + '_' + location.region] || location.region
  },

  getNowInfo: function(tzOffset) {
    var date = new Date()
    // TODO: set timezone diff by new Date().getTimezoneOffset() from client
    // set Japan timezone by default for now
    tzOffset = tzOffset || 540
    date.setTime(date.getTime() + tzOffset * 60 * 1000)
    var hour = ('0' + date.getHours()).slice(-2)
    var minites = ('0' + date.getMinutes()).slice(-2)
    var daysOfWeek = constants.DaysOfWeek[date.getDay()]
    return {
      hour: hour,
      minites: minites,
      diplayTime: hour + ':' + minites,
      daysOfWeek: daysOfWeek
    }
  },

  updateOpenNow: function(restaurant, photos, tzOffset) {
    // add open_now properties with the current time
    var openNow = util.checkOpenNow(restaurant.open_hours, restaurant.shop_holidays, tzOffset)
    restaurant.open_now = openNow
    photos.forEach(function(photo) {
      photo.open_now = openNow
    })
  },

  checkOpenNow: function(openHours, shopHolidays, tzOffset) {
    if (!openHours) {
      return false
    }
    var nowInfo = util.getNowInfo(tzOffset)
    // check today is closed by daysOfWeek
    if (shopHolidays.day_of_week && shopHolidays.day_of_week.indexOf(nowInfo.daysOfWeek) !== -1) {
      // return as closed
      return false
    }
    // TODO check holiday in the country

    // e.g. 22:35
    var currentDisplayTime = nowInfo.diplayTime
    var array = openHours[nowInfo.daysOfWeek]
    if (!array || array.length === 0) {
      array = openHours['default'] || []
    }
    var opened = false
    for (var i=0; i<array.length; i++) {
      var item = array[i]
      if (item.start < currentDisplayTime && currentDisplayTime < item.end) {
        opened = true
        break
      }
    }
    return opened
  },

  // {"currency":{"name":"JPY","symbol":"¥"},
  //   "range":{
  //     "dinner":{"high":14999,"low":10000},
  //     "lunch":{"high":3999,"low":3000}
  //   }
  // }
  // convert to -> [{label: "ランチ", value: "〜¥999"}, {label: "ディナー", value: "¥3,000〜¥3,999"}]
  displaybudgets: function(budget, labels) {
    if (!budget) {
        return []
    }
    var results = []
    var symbol = budget.currency && budget.currency.symbol || '¥'
    var lunch = budget.range.lunch
    var dinner = budget.range.dinner
    if (lunch && (lunch.low || lunch.high)) {
      var lunchArr = []
      lunchArr.push(lunch.low ? symbol + util.numberFormat(lunch.low) : '')
      lunchArr.push(lunch.high ? symbol + util.numberFormat(lunch.high) : '')
      results.push({
        label: labels.constants_budget_type_lunch,
        value: lunchArr.length > 0 ? lunchArr.join('〜') : '-'
      })
    }
    if (dinner && (dinner.low || dinner.high)) {
      var dinnerArr = []
      dinnerArr.push(dinner.low ? symbol + util.numberFormat(dinner.low) : '')
      dinnerArr.push(dinner.high ? symbol + util.numberFormat(dinner.high) : '')
      results.push({
        label: labels.constants_budget_type_dinner,
        value: dinnerArr.length > 0 ? dinnerArr.join('〜') : '-'
      })
    }
    return results
  },

  // [{"end":"15:30","lo":"15:00","start":"11:30","type":"default"},{"end":"20:00","lo":"19:30","start":"11:30","type":"saturday"},{"end":"17:00","lo":"16:30","start":"11:30","type":"sunday"},{"end":"21:30","lo":"21:00","start":"18:30","type":"default"}]
  // convert to -> [{label: "水曜日", value: "11:30-15:00 (L.O. 14:30) 17:00-22:00 (L.O. 21:30)"},...]
  displayOpenHours: function(openHours, shopHolidays, tzOffset, labels) {
    var nowInfo = util.getNowInfo(tzOffset)
    var displayList = [].concat(constants.DaysOfWeek)
    var index = displayList.indexOf(nowInfo.daysOfWeek)
    var results = []
    displayList.forEach(function(dayOfWeek, i) {
      var obj = {
        label: labels['constants_DayOfWeek_' + dayOfWeek],
        value: "-",
        today: index === i
      }
      if (openHours) {
        // check the day is closed by daysOfWeek
        if (shopHolidays.day_of_week && shopHolidays.day_of_week.indexOf(dayOfWeek) !== -1) {
          obj.value = labels.open_hours_closed
        } else {
          var array = openHours[dayOfWeek]
          if (!array || array.length === 0) {
            array = openHours['default'] || []
          }
          var strs = []
          array.forEach(function(item) {
            strs.push((item.start || '') + '-' + (item.end || '') + (item.lo ? ' (' + labels.open_hours_lo + ' ' + item.lo + ')' : ''))
          })
          obj.value = strs.join(' ')
        }
      }
      results.push(obj)
    })
    return results
  },

  displayShopHolidays: function(obj, labels) {
    if (!obj) {
        return '-'
    }
    // day_of_week, holiday, irregular
    var results = []
    if (obj.day_of_week) {
      obj.day_of_week.forEach(function(dayOfWeek) {
        results.push(labels['constants_DayOfWeek_' + dayOfWeek])
      })
    }
    if (obj.holiday) {
      results.push(labels['constants_holidays_holiday'])
    }
    if (obj.irregular) {
      results.push(labels['constants_holidays_irregular'])
    }
    return results.length > 0 ? results.join(', ') : '-'
  },

  displayCards: function(obj, labels) {
    if (!obj) {
      return '-'
    }
    switch (obj.availability) {
      case 'yes': 
        var cards = obj.types || [],
          cardLabels = []
        cards.forEach(function(card) {
          cardLabels.push(labels['card_' + card] || card)
        })
        return labels.availability_yes + (cardLabels.length > 0 ? ' (' + cardLabels.join(', ') + ')' : '')
      case 'no':
        return labels.availability_no
      default:
        return '-'
    }
  },

  displaySmoking: function(value, labels) {
    switch (value) {
      case 'yes': 
        return labels.availability_yes
      case 'no':
        return labels.availability_no
      case 'sectionalized':
        return labels.availability_smoking_sectionalized
      default:
        return '-'
    }
  },

  displayNumberOfSeats: function(value, labels) {
    return !value || (value - 0 < 0) ? '-' : value + ''
  }
}

module.exports = util