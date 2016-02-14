/**
 * Cache
 * Store API response cache and temp data
 */
export default {

  _ref: {
    // key: GET url with parameters, value: {response: {}}
    requests: {},

    // for map view
    // {latitude: null, longitude: null}
    currentLocation: null,

    // URL histories to move by back button
    histories: [],

    // force reload with ignoring Vue keep-alive
    _forceReload: {
      'page-top': true
    }
  },

  set(key, value) {
    this._ref[key] = value
  },

  get(key) {
    return this._ref[key]
  },

  getRequestCache(url) {
    return this._ref.requests[url] && this._ref.requests[url].response || null
  },

  setRequestCache(url, response) {
    console.log('request response cache is updated: ' + url)
    this._ref.requests[url] = {
      response: response
    }
  },

  clearRequestsCache() {
    this._ref.requests = {}
  },

  enableForceReload(componentId) {
    this._ref._forceReload[componentId] = true
  },

  disableForceReload(componentId) {
    this._ref._forceReload[componentId] = false
  },

  needForceReload(componentId) {
    return this._ref._forceReload[componentId] || false
  }

}
