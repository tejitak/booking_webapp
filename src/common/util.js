var _ = require('underscore')

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

  addDistanceProps: function(photos, currentLocation) {
    if (photos) {
      photos.forEach(function(photo) {
        if (photo.location) {
          photo.distance = util.getDistance({
            longitude: photo.location[0],
            latitude: photo.location[1]
          }, currentLocation)
        }
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
  }

}

module.exports = util