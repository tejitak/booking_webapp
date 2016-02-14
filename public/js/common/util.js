import $ from 'npm-zepto'
import Slideout from '../lib/slideout'
import config from './config'
import cache from './cache'
import localStorage from './localStorage'
import Query from './Query'
import constants from '../../../controllers/constants'

var util = {

  // for router
  _app: null,

  _requests: {},

  init(app) {
    this._app = app
  },

  isIOS() {
    var ua = navigator.userAgent.toLowerCase()
    return ua.indexOf('iphone') !== -1 || ua.indexOf('ipod') !== -1 || ua.indexOf('ipad') !== -1
  },

  isAndroid() {
    var ua = navigator.userAgent.toLowerCase()
    return ua.indexOf('android') !== -1
  },

  isPC() {
    return $(window).width() > 680
  },

  escapeHTML(text) {
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  },

  trim(str) {
    if (str === null) { str = '' }
    str = str.trim()
    return str.replace(/\n/g, '')
  },

  redirect(path, replace) {
    // check last one is same and skip it
    var histories = cache.get('histories')
    if (histories[histories.length - 1] !== path) {
      cache.get('histories').push(path)
    }
    // for dirctor html5 history api
    if (path.indexOf('#') === 0) {
      path = path.substring(1, path.length)
    }
    // save query parameters as a hash
    var hash = this.generateCurrentQueryHashParameters()
    if (hash) {
      path += hash
    }
    if (this._app && this._app.router) {
      if (replace) {
        // does not store current page in browser history
        window.history.replaceState({}, document.title, path)
        // trigger router
        window.onpopstate()
      } else {
        this._app.router.setRoute(path)
      }
    } else {
      // called from server rendered single page e.g. detail page
      location.href = path
    }
  },

  generateCurrentQueryHashParameters() {
    // remove parameters in hash if exists
    var hash = location.hash
    var paramStr = Query.getInstance().serialize()
    return hash.replace(/\?.*/g, '') + ((paramStr === '{}') ? '' : '?q=' + encodeURIComponent(paramStr))
  },

  updateHashByQuery() {
    location.hash = this.generateCurrentQueryHashParameters()
  },

  // filter an item from list by id prop
  getItemById(items, targetId, idProp) {
    var results = $.grep(items, (item) => {
      return item['_id' || idProp] === targetId
    })
    return (results && results[0]) || null
  },

  getSlideOut: (() => {
    // setup slideout at initialization
    var $menu = document.getElementById('menu')
    if (!$menu) {
      return
    }
    var slideout = new Slideout({
      'panel': document.getElementById('main'),
      'menu': $menu,
      'padding': 256,
      'tolerance': 70
    })
    // add event handler on main to close by click
    $('.component__main').on('click', (e) => {
      if (slideout.isOpen()) {
        slideout.close()
      }
    })
    // disable slideout by default
    slideout.disableTouch()
    return () => slideout
  })(),

  timestamp() {
    return new Date().getTime()
  },

  openWindow(url, reloadOnClose) {
    var win = window.open(url, '_blank', 'toolbar=0,location=0,menubar=0')
    if (window.focus) { win.focus() }
    if (reloadOnClose) {
      var timer = setInterval(function() {
        if (win.closed) {
          clearInterval(timer)
          location.reload()
        }
      }, 600)
    }
  },

  request(options = {}) {
    return new Promise((resolve, reject) => {
      // var headers = options.headers || {}
      // headers['X-Parse-Application-Id'] = config.api.appId
      // headers['X-Parse-REST-API-Key'] = config.api.appKey
      // headers['X-Parse-Session-Token'] = $.fn.cookie(constants.cookieNames.session) || ''
      var type = options.type || 'GET'
      var data = options.data || null
      var cache = options.cache || false
      if (data && type !== 'GET') {
        data = JSON.stringify(data)
        // no cache
        cache = true
      }
      var requestId = util.timestamp()
      var xhr = $.ajax({
        type: type,
        // headers: headers,
        url: options.url,
        data: data,
        dataType: options.dataType || 'json',
        contentType: options.contentType || 'application/json; charset=utf-8',
        crossDomain: options.crossDomain || false,
        cache: cache,
        async: !options.sync,
        success: resolve,
        error: reject,
        complete() {
          delete util._requests[requestId]
        }
      })
      util._requests[requestId] = xhr
    })
  },

  abortRequests() {
    // abort all existing requests
    for (var requestId in util._requests) {
      if (requestId && util._requests[requestId]) {
        util._requests[requestId].abort()
      }
    }
    util._requests = {}
  },

  getSerializeAjaxUrl(options) {
    var url = options.url
    var data = options.data
    if (!options.data) {
      return url
    }
    var query = $.param(data)
    if (query === '') {
      return url
    } else {
      return (url + '&' + query).replace(/[&?]{1,2}/, '?')
    }
  },

  getCurrentLocation() {
    // store the result to localStorage
    return new Promise((resolve, reject) => {
      // workaround not to work timeout by 7 sec
      var timeout = 7000
      var fail = (err) => {
        localStorage.remove('hashdish.locationAllowed')
        cache.set('currentLocation', null)
        // update sort params to popular
        if (Query.getInstance().params.order === '$near') {
          Query.getInstance().params.order = '-like_count'
        }
        reject(err)
      }
      var timer = setTimeout(fail, timeout)
      navigator.geolocation.getCurrentPosition((pos) => {
        clearTimeout(timer)
        localStorage.set('hashdish.locationAllowed', true)
        cache.set('currentLocation', pos.coords)
        resolve(pos.coords)
      }, (err) => {
        clearTimeout(timer)
        fail(err)
      }, {
        enableHighAccuracy: true,
        timeout: timeout,
        maximumAge: 0
      })
    })
  },

  detect(list, iterator) {
    var r = null
    list.forEach((obj) => {
      var result = iterator(obj)
      if (result) {
        r = obj
      }
    })
    return r
  },

  throttle(callback, limit) {
    var wait = false
    return function (e) {
      if (!wait) {
        callback(e)
        wait = true
        setTimeout(function () {
          wait = false
          callback(e)
        }, limit)
      }
    }
  },

  debouncer(onStart, onStop, delay) {
    var timer
    var count = 0
    return (e) => {
      if (count === 0) {
        onStart && onStart(e)
      }
      timer && clearTimeout(timer)
      timer = setTimeout(() => {
        onStop && onStop(e)
        count = 0
      }, delay || 500)
    }
  },

  pluck(arr, key) {
    if (!arr || arr.length === 0) { return [] }
    var newArr = []
    arr.forEach((obj) => {
      newArr.push(obj[key])
    })
    return newArr
  },

  flatten(arr) {
    return Array.prototype.concat.apply([], arr)
  },

  simpleDeepClone(data) {
    return JSON.parse(JSON.stringify(data))
  },

  scrollTo(element, to, duration) {
    if (duration < 0) return
    var difference = to - element.scrollTop
    var perTick = difference / duration * 10

    setTimeout(function() {
      element.scrollTop = element.scrollTop + perTick
      if (element.scrollTop === to) return
      util.scrollTo(element, to, duration - 10)
    }, 10)
  },

  convertInstagramSmallImageUrl(imageUrl) {
    return imageUrl.replace('/e35/', '/s320x320/e35/')
  },

  watchMove() {
    var hideThreshold = 5
    var showThreshold = 10
    var startY = -1
    var $body = $(document.body)
    var $win = $(window)
    // add initial state
    $body.addClass(constants.UI.CLASSES.showHeader)
    return (e) => {
      // store pos by touhchStart
      var y = e.touches[0].clientY
      if (e.type === 'touchstart') {
        startY = y
      }
      // always shown in top area
      if ($win.scrollTop() < 60) {
        $body.removeClass(constants.UI.CLASSES.hideHeader)
        $body.addClass(constants.UI.CLASSES.showHeader)
      } else if (e.type !== 'touchstart') {
        if (startY - hideThreshold > y && $body.hasClass(constants.UI.CLASSES.showHeader)) {
          $body.toggleClass(constants.UI.CLASSES.hideHeader)
          $body.toggleClass(constants.UI.CLASSES.showHeader)
        } else if (startY + showThreshold < y && $body.hasClass(constants.UI.CLASSES.hideHeader)) {
          $body.toggleClass(constants.UI.CLASSES.hideHeader)
          $body.toggleClass(constants.UI.CLASSES.showHeader)
        }
      }
      return true
    }
  },

  watchScroll(e) {
    if ($(window).scrollTop() < 60) {
      var $body = $(document.body)
      if ($body.hasClass(constants.UI.CLASSES.hideHeader)) {
        $body.toggleClass(constants.UI.CLASSES.hideHeader)
        $body.toggleClass(constants.UI.CLASSES.showHeader)
      }
    }
  },

  showHeader() {
    var $body = $(document.body)
    $body.removeClass(constants.UI.CLASSES.hideHeader)
    $body.addClass(constants.UI.CLASSES.showHeader)
  },

  shareTwitter(shareUrl = location.href, shareText = document.title, hashtags = 'hashdish') {
    // replace share url for detail
    shareUrl = shareUrl.replace('/#/detail/', '/detail/')
    window.open('http://twitter.com/share?url=' + encodeURIComponent(shareUrl) + '&text=' + encodeURIComponent(shareText) + '&hashtags=' + encodeURIComponent(hashtags), 'TwitterShare', 'width=550,height=450,resizable=yes,scrollbars=no')
  },

  shareFacebook(shareUrl = location.href) {
    // replace share url for detail
    shareUrl = shareUrl.replace('/#/detail/', '/detail/')
    window.open('http://wwww.facebook.com/sharer.php?u=' + encodeURIComponent(shareUrl), 'FacebookShare', 'width=550,height=450,resizable=yes,scrollbars=no')
  },

  shareLine(shareUrl = location.href, shareText = document.title) {
    // replace share url for detail
    shareUrl = shareUrl.replace('/#/detail/', '/detail/')
    location.href = 'http://line.me/R/msg/text/?' + shareText + ' ' + shareUrl
  }
}

export default util