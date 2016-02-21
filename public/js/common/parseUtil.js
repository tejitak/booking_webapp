'use strict'
import $ from 'npm-zepto'
import util from './util'
import cache from './cache'
import labels from './labels'
import config from './config'
import constants from '../../../controllers/constants'

/**
 * parse wrapper for application level interface
 */
export default {

  _requestCount: 0,

  // prevent double requests
  _requestingMap: {},

  init (app) {
    // set app to show / hide login panel
    this._app = app
  },

  _request (options = {}) {
    return new Promise((resolve, reject) => {
      var serializedUrl = util.getSerializeAjaxUrl(options)
      if (!options.force && (!options.type || options.type === 'GET')) {
        // check GET request cache
        var cached = cache.getRequestCache(serializedUrl)
        if (cached) {
          console.log('request response from cache: ' + serializedUrl)
          return resolve(cached)
        }
      }
      if (this._requestingMap[serializedUrl]) {
        // throw double click requests
        throw new Error('Duplicated requests')
      }
      this._requestingMap[serializedUrl] = true
      // add locale information becuase headers cannot be reached from cloud code
      options.data = $.extend(options.data || {}, {
        locale: navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage)
      })
      options.crossDomain = true
      // add currentGeo if exists for cloud code functions
      var currentLocation = cache.get('currentLocation')
      if (currentLocation) {
        options.data = $.extend(options.data || {}, {
          currentGeo: {'__type': 'GeoPoint', latitude: currentLocation.latitude, longitude: currentLocation.longitude}
        })
      }
      // call normaily
      util.request(options).then((res) => {
        // cache response
        if (options.requestCache) {
          cache.setRequestCache(serializedUrl, res)
        }
        resolve(res)
      }).catch((xhr, status, err) => {
        var json = null
        try {
          json = JSON.parse(xhr.response)
        } catch (e) {}
        // http://blog.parse.com/announcements/validating-session-tokens-with-the-rest-api/
        if (json && (json.code === 209 || json.code === 101)) {
          // invalidate session
          this.invalidateSession()
          this._app.$emit('showLoginModal')
        }
        reject(json)
      }).then(() => {
        // always called
        delete this._requestingMap[serializedUrl]
      })
      this._requestCount++
    })
  },

  isLoggedIn () {
    // check session token exists
    return !!$.fn.cookie(constants.cookieNames.session)
  },

  invalidateSession () {
    $.fn.cookie(constants.cookieNames.session, null)
    // remove all resonse caches
    cache.clearRequestsCache()
  },

  checkLoggedIn () {
    return new Promise((resolve, reject) => {
      // throw error for no loggedIn
      if (!this.isLoggedIn()) {
        throw new Error(labels.error_auth)
      } else {
        resolve()
      }
    })
  },

  fetchMe () {
    return this._request({
      url: config.api.url + '/users/me'
    })
  },

  fetchPhotoList (params) {
    params = params || {}
    params.limit = params.limit || 20
    return new Promise((resolve, reject) => {
      this._request({
        url: config.api.url + '/booking',
        data: params
      }).then((response) => {
        resolve(response)
      }, reject)
    })
  },

  fetchListing (listingId) {
    return new Promise((resolve, reject) => {
      this._request({
        url: config.api.url + '/booking/' + listingId
      }).then((response) => {
        resolve(response)
      }, reject)
    })
  },

  fetchMyPage () {
    return new Promise((resolve, reject) => {
      this.checkLoggedIn().then(() => {
        this._request({
          url: config.api.url + '/functions/mypage',
          data: {
            demo: true,
            timezoneOffset: -(new Date().getTimezoneOffset())
          }
        }).then((response) => {
          resolve(response)
        })
      }).catch((e) => {
        this._app.$emit('showLoginModal')
      })
    })
  },

  fetchSuggestions (params) {
    return new Promise((resolve, reject) => {
      this._request({
        url: config.api.url + '/functions/suggestions',
        data: params
      }).then((response) => {
        resolve(response)
      }, reject)
    })
  },

  like (photoId) {
    return new Promise((resolve, reject) => {
      // ACL and from will be added in cloud code
      this.checkLoggedIn().then(() => {
        this._request({
          url: config.api.url + '/functions/like',
          data: {photoId: photoId},
          type: 'POST'
        })
      }).catch((e) => {
        // show login popup
        this._app.$emit('showLoginModal')
      })
    })
  },

  unlike (photoId) {
    return new Promise((resolve, reject) => {
      this.checkLoggedIn().then(() => {
        this._request({
          url: config.api.url + '/functions/unlike',
          data: {photoId: photoId},
          type: 'POST'
        })
      }).catch((e) => {
        // show login popup
        this._app.$emit('showLoginModal')
      })
    })
  }
}
