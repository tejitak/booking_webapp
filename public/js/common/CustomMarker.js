const google = window.google
const $ = window.$

class CustomMarker extends google.maps.OverlayView {

  constructor(options = {}) {
    super()
    this._latlng = options.position
    this._imageUrl = options.imagePath
    this._w = options.width
    this._h = options.height
    this._zIndex = options.zIndex || 2
    this.setMap(options.map)
  }

  draw() {
    var that = this
    var div = this._div
    if (!div) {
      div = this._div = document.createElement('DIV')
      // div.style.width = this._w + 4 + "px"
      // div.style.height = this._h + 4 + "px"
      div.className = 'customMarker'
      div.style.zIndex = this._zIndex
      var img = document.createElement('img')
      img.src = this._imageUrl
      img.width = this._w
      img.height = this._h
      div.appendChild(img)
      google.maps.event.addDomListener(div, 'click', function(event) {
        google.maps.event.trigger(that, 'click')
      })
      this.getPanes().overlayImage.appendChild(div)
    }
    var point = this.getProjection().fromLatLngToDivPixel(this._latlng)
    if (point) {
      var $div = $(div)
      div.style.left = (point.x - $div.width() / 2) + 'px'
      div.style.top = (point.y - $div.height() / 2) + 'px'
    }
  }

  remove() {
    if (this._div) {
      this._div.parentNode.removeChild(this._div)
      this._div = null
    }
  }

  getPosition() {
    return this._latlng
  }

  setSelected(selected) {
    if (this._div) {
      selected ? $(this._div).addClass('selected') : $(this._div).removeClass('selected')
    }
  }
}

module.exports = CustomMarker