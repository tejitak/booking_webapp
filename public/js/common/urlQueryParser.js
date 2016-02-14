import $ from 'npm-zepto'
import config from './config'

export default {

  getUrlQueryParams() {
    return $.deparam(location.q.substring(1))
  },

  getParamsFromHash() {
    var hashArr = location.hash.split('?')
    return (hashArr && hashArr[1]) ? $.deparam(hashArr[1]) : null
  },

  // return for parse search query params
  // e.g. /#search?q={"where":{"town":{"$regex":"shibuya"}}}#/
  getUrlSearchQueryParams() {
    var q = {}
    var params = this.getParamsFromHash()
    // var params = this.getUrlQueryParams()
    if (params && params.q) {
      try {
        q = JSON.parse(decodeURIComponent(params.q))
      } catch (e) {}
    }
    return q
  },

  getUrlSearchQueryParamsStr() {
    var paramStr = JSON.stringify(this.getUrlSearchQueryParams())
    return paramStr === '{}' ? '' : '?' + paramStr
  }
}