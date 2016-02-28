<template>
  <div class="page__map">
    <div class="map_header" v-el:filter-info-wrap>
      <component-filter-info></component-filter-info>
    </div>
      <div class="map_main">
        <div id="map_canvas" :style="{height: mapHeight}"></div>
      </div>
      <div class="map_float_button_wrap" @click="onClickList">
        <span>{{labels.common_list}}</span>
      </div>
      <div class="preview_overlay" v-show="selectedPhoto" transition="fade_layer"></div>
      <div class="preview" v-if="selectedPhoto" @click="back" transition="fade">
        <div class="preview_card">
          <component-preview-card :photo.sync="selectedPhoto" :show-restaurant-link="true"></component-preview-card>
        </div>
      </div>
  </div>
</template>

<script>
import $ from 'npm-zepto'
import util from '../../common/util'
import config from '../../common/config'
import cache from '../../common/cache'
import labels from '../../common/labels'
import Query from '../../common/Query'
import localStorage from '../../common/localStorage'
import mapUtil from '../../common/mapUtil'
import filter from '../filters/filter'
import urlQueryParser from '../../common/urlQueryParser'
import constants from '../../../../controllers/constants'
import componentPreviewCard from '../components/previewCard.vue'
import componentFilterInfo from '../components/filterInfo.vue'
import pageTop from '../pages/top.vue'

// extend pageTop
var Component = {
  data() {
    return {
      initialized: false,
      zoom: 16,
      displayRestaurantPhotos: [],
      selectedPhoto: null,
      queryParams: {
        include: 'photos',
        limit: 40,
        box: []
      },
      // shibuya {latitude: 35.658129, longitude: 139.702133}
      initPos: constants.areaCoords['A1303'],
      // to reload when search tag condition is changed
      prevBaseQueryStr: '',
      // initial height
      mapHeight: '100%',
      labels: labels
    }
  },

  components: {
    'component-preview-card': componentPreviewCard,
    'component-filter-info': componentFilterInfo
  },

  created() {
    this.attachEvents()
  },

  attached() {
    this._detached = false
    if (this._map) {
      this.resize()
      // when moving back to page
      this.initialized = true
      // clear additional query e.g. $near, $box
      Query.getInstance().setAdditionalQuery(null)
      // load data if items are empty
      if (this.displayRestaurantPhotos.length === 0 || this.prevBaseQueryStr !== Query.getInstance().serialize()) {
        this.initialLoad()
      }
    }
  },

  detached() {
    this._detached = true
    this.initialized = false
    this._requesting = false
    this.selectedPhoto = null
    $(window).off('resize.map')
    clearInterval(this._myLocationInterval)
  },

  ready() {
    if (!this._map) {
      // call after async map script is loaded
      mapUtil.lazyInit().then(this.initMap.bind(this))
    }
  },

  methods: {
    attachEvents() {
      this.$on('showPreivewPhoto', this.showPreviewPhoto.bind(this))
      // hide preview for history back after showing preview
      this.$on('onRouteAgain', this.hidePreview.bind(this))
      this.$on('onSearchResultsChanged', this.onSearchResultsChanged.bind(this))
      this.$on('onSearchResultsMore', this.onSearchResultsMore.bind(this))
      // clear in background while search page is shown
      this.$on('onBaseQueryConditionChanged', this.clear.bind(this))
    },

    initMap() {
      var that = this
      this._mapNode = document.getElementById('map_canvas')
      this.resize()
      this._map = mapUtil.create(this._mapNode, {
        lat: this.initPos.latitude,
        lng: this.initPos.longitude,
        zoom: 14,
        onDragEnd() {
          // load with the map center position
          that.loadByCenterLocation(true/* more */)
        }
      })
      this.initialLoad()
    },

    initialLoad() {
      // check area query condition is specified
      var currentQueryArea = Query.getInstance().params.area
      if (currentQueryArea !== constants.blankOptionValue) {
        // if specified, move to the selected area and search
        this.initRender(constants.areaCoords[currentQueryArea])
      } else {
        // if not specified, try to use current location
        // check location service is allowed by localStorage
        var locationAllowed = localStorage.get('hashdish.locationAllowed')
        if (locationAllowed === false) {
        } else if (cache.get('currentLocation')) {
          // firstly check location cache
          this.initRender(cache.get('currentLocation'))
        } else {
          // already configured or not yet configured -> try to get current location
          this.updateCurrentLocation().then((coords) => {
            // if success -> search with the current location
            this.initRender(coords)
          }, () => {
            // if fail -> update basic query area condition + search with the selected area location
            // temp to set shibuya by default for location fail
            var defaultAreaId = 'A1303'
            this.$dispatch('updateSearchArea', defaultAreaId)
            this.initRender(constants.areaCoords[defaultAreaId])
          })
        }
      }
    },

    initRender(coords) {
      this._map.setCenter(coords).then(() => {
        // set zoom
        this._map.setZoom(this.zoom)
        // load items
        this.initialized = true
        this.loadByCenterLocation()
        // attach resizer
        $(window).on('resize.map', this.resize.bind(this))
        this._myLocationInterval = setInterval(() => {
          this.updateCurrentLocation(true/* noMove */).catch((e) => {
            // user denied location service
          })
        }, 10000)
      })
    },

    onSearchResultsChanged(response) {
      // set center if area is specified
      var currentQueryArea = Query.getInstance().params.area
      if (currentQueryArea !== constants.blankOptionValue) {
        // if specified, move to the selected area and search
        this._map.setCenter(constants.areaCoords[currentQueryArea]).then(() => {
          this.render(response.result)
        })
      } else {
        this.render(response.result)
      }
      // save base query (not include additional query)
      this.prevBaseQueryStr = Query.getInstance().serialize()
      return true
    },

    onSearchResultsMore(response) {
      this.render(response.result)
    },

    clear() {
      // clear existing markers
      if (this._map) {
        this._map.clearMarkers()
      }
      this.displayRestaurantPhotos = []
    },

    render(result) {
      if (this._detached) { return }
      this._requesting = false
      var that = this
      var photos = result.photos
      // add new markers
      photos.forEach((photo, i) => {
        if (!this._map.exists(photo._id)) {
          this._map.addMarker({
            id: photo._id,
            lat: photo.location[1],
            lng: photo.location[0],
            imageUrl: photo.photo_url,
            onClickMarker() {
              that.$dispatch('onSelectCard', photo)
            }
          })
          this.displayRestaurantPhotos.push(photo)
        }
      })
      this.resize()
    },

    buildGeoQuery() {
      // reference: https://parse.com/docs/rest/guide/#geopoints-geo-queries
      // construct query params
      var latlngBounds = this._map.getBounds()
      if (!latlngBounds) {
        // map is not loaded yet
        return []
      }
      var swLatlng = latlngBounds.getSouthWest()
      var neLatlng = latlngBounds.getNorthEast()
      return [
        {
          '__type': 'GeoPoint',
          'latitude': swLatlng.lat(),
          'longitude': swLatlng.lng()
        },
        {
          '__type': 'GeoPoint',
          'latitude': neLatlng.lat(),
          'longitude': neLatlng.lng()
        }
      ]
    },

    loadByCenterLocation(more) {
      if (this._requesting || this._detached || !this.initialized) {
        return
      }
      this._requesting = true
      this.queryParams.box = this.buildGeoQuery()
      this.$dispatch('performSearch', {
        additionalQuery: this.queryParams,
        more: more
      })
    },

    updateCurrentLocation(noMove) {
      // call with interval or click current location button
      return util.getCurrentLocation().then((coords) => {
        if (noMove) {
          return new Promise((resolve, reject) => {
            // just update my location
            this._map.updateMyLocation(coords)
            resolve()
          })
        } else {
          // update my location and move to center
          return this.setCurrentLocationMarker(coords)
        }
      }, () => {
        // fail to get current location
        return new Promise((resolve, reject) => {
          reject()
        })
      })
    },

    setCurrentLocationMarker(coords) {
      // place current location marker?
      return new Promise((resolve, reject) => {
        this._map.setMyLocation(coords).then(() => {
          resolve(coords)
        })
      })
    },

    // called by router
    showPreviewPhoto(photoId) {
      if (this._detached) { return }
      const photo = util.getItemById(this.displayRestaurantPhotos, photoId)
      // set as selected photo
      this.selectedPhoto = photo
      // move to center position
      const geo = {
        latitude: photo.location[1],
        longitude: photo.location[0]
      }
      this._map.setCenter(geo).then(() => {
        // load by the selected location
        this.loadByCenterLocation(true/* more */)
      })
    },

    resize() {
      if (this._mapNode) {
        var headerH = 44
        // $(this._mapNode).height($(window).height() - headerH)
        this.mapHeight = ($(window).height() - headerH - $(this.$els.filterInfoWrap).height()) + 'px'
      }
      if (this._map) {
        this._map.resize()
      }
    },

    onClickList() {
      util.redirect('#/')
    },

    back() {
      history.back()
    }
  }
}
// TODO: temp for load
Component.computed = $.extend({}, pageTop.computed, Component.computed)
Component.methods = $.extend({}, pageTop.methods, Component.methods)
export default Component
</script>