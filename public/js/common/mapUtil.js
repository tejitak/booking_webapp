// async callback when google map script is loaded
var initPromise = new Promise((resolve, reject) => {
  window.initMap = () => {
    resolve()
  }
})

class Map {

  constructor(map) {
    // constants
    this._markerSize = 36
    this._displayedIdMap = {}
    this._markers = []
    this._map = map
    this._currentPlaceCircle = null
    this._currentPlaceMarker = null
    // this.markerIcon = new window.google.maps.MarkerImage('/img/icons/map_goal_icon.png', new window.google.maps.Size(24, 35), new window.google.maps.Point(24, 35), new window.google.maps.Point(12, 35))
    // this.currentPlaceIcon = new window.google.maps.MarkerImage('/img/icons/map_blue_circle.png', new window.google.maps.Size(32, 32), new window.google.maps.Point(16, 16), new window.google.maps.Point(8, 8))
    // this.markerIcon = new window.google.maps.MarkerImage('/img/icons/map_goal_icon.png', new window.google.maps.Size(24, 36))
    this.currentPlaceIcon = new window.google.maps.MarkerImage('/img/icons/current_location.png', new window.google.maps.Size(40, 40))
  }

  exists(id) {
    return this._displayedIdMap[id] === true
  }

  addMarker(opt = {}) {
    var id = opt.id
    var lat = opt.lat
    var lng = opt.lng
    var onClickMarker = opt.onClickMarker
    var imageUrl = opt.imageUrl
    // dup check
    if (this.exists(id)) {
      return
    }
    var ms = this._markerSize
    var gLatLng = new window.google.maps.LatLng(lat, lng)

    // TODO: use custom marker to show category?
    // var marker = new window.google.maps.Marker({
    //   position: gLatLng,
    //   map: this._map,
    //   icon: this.markerIcon
    // })
    // lazy class definition due to async load of google map script
    var CustomMarker = require('./CustomMarker')
    var marker = new CustomMarker({
      position: gLatLng,
      map: this._map,
      imagePath: imageUrl,
      width: 48,
      height: 48
    })

    if (onClickMarker) {
      window.google.maps.event.addListener(marker, 'click', onClickMarker)
    }
    this._markers.push(marker)
    this._displayedIdMap[id] = true
  }

  clearMarkers() {
    for (var name in this._displayedIdMap) {
      if (name && this._displayedIdMap[name]) {
        this._displayedIdMap[name] = false
      }
    }
    this._markers.forEach((marker, i) => {
      marker.setMap(null)
    })
    this._markers = []
  }

  getCenter() {
    return this._map.getCenter()
  }

  setCenter(coords) {
    return new Promise((resolve, reject) => {
      // set to center
      this._map.panTo(new window.google.maps.LatLng(coords.latitude, coords.longitude))
      // temp workaround for no firing
      var called = false
      window.google.maps.event.addListenerOnce(this._map, 'idle', () => {
        if (!called) {
          called = true
          resolve()
        }
      })
      // force fire for 1 seconds
      setTimeout(() => {
        if (!called) {
          called = true
          resolve()
        }
      }, 1500)
    })
  }

  setZoom(zoom) {
    this._map.setZoom(zoom)
  }

  updateMyLocation(coords) {
    var lat = coords.latitude
    var lng = coords.longitude
    var accuracy = coords.accuracy
    this.removeOverlays()
    var gLatLng = new window.google.maps.LatLng(lat, lng)
    // draw a circle with acc
    this._currentPlaceCircle = new window.google.maps.Circle({
      strokeColor: '#7eabe3',
      strokeWeight: 1,
      strokeOpacity: 1,
      fillColor: '#d7e5ed',
      fillOpacity: 0.35,
      center: gLatLng,
      radius: accuracy,
      map: this._map
    })
    // add blue icon at center
    this._currentPlaceMarker = new window.google.maps.Marker({
      position: gLatLng,
      icon: this.currentPlaceIcon,
      map: this._map
    })
  }

  setMyLocation(coords) {
    this.updateMyLocation(coords)
    return this.setCenter(coords)
  }

  removeOverlays() {
    if (this._currentPlaceCircle) {
      this._currentPlaceCircle.setMap(null)
      this._currentPlaceCircle = null
    }
    if (this._currentPlaceMarker) {
      this._currentPlaceMarker.setMap(null)
      this._currentPlaceMarker = null
    }
  }

  getBounds() {
    return this._map.getBounds()
  }

  resize() {
    window.google.maps.event.trigger(this._map, 'resize')
  }
}

export default {

  newInstance(map) {
    return new Map(map)
  },

  create(mapNode, opt = {}) {
    var MY_MAPTYPE_ID = 'HashDish_style'
    var lat = opt.lat
    var lng = opt.lng
    var zoom = opt.zoom
    var onDragEnd = opt.onDragEnd

    var map = new window.google.maps.Map(mapNode, {
      center: new window.google.maps.LatLng(lat, lng),
      zoom: zoom || 12,
      // mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      mapTypeId: MY_MAPTYPE_ID,
      mapTypeControl: false,
      panControl: true,
      panControlOptions: {
        position: window.google.maps.ControlPosition.TOP_RIGHT
      },
      zoomControl: true,
      zoomControlOptions: {
        style: window.google.maps.ZoomControlStyle.LARGE,
        position: window.google.maps.ControlPosition.TOP_RIGHT
      },
      scaleControl: true,
      streetViewControl: true,
      streetViewControlOptions: {
        position: window.google.maps.ControlPosition.TOP_RIGHT
      }
    })

    var customMapType = new window.google.maps.StyledMapType([
      {
        'stylers': [{'hue': '#0069b2'}, {'saturation': -70}],
        'elementType': 'all',
        'featureType': 'all'
      }, {
        'featureType': 'poi',
        'elementType': 'labels',
        'stylers': [
          { 'visibility': 'off' }
        ]
      }], {
        'name': 'Hashdish Map'
      }
    )
    map.mapTypes.set(MY_MAPTYPE_ID, customMapType)

    if (onDragEnd) {
      window.google.maps.event.addListener(map, 'idle', function () {
        onDragEnd()
      })
    }
    return this.newInstance(map)
  },

  lazyInit() {
    return initPromise
  }
}