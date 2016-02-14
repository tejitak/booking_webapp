if (window.Promise === undefined) {
  alert('This browser is not supported')
}

import Vue from 'vue'
import {Router} from 'director'
import config from '../common/config'
import labels from '../common/labels'
import util from '../common/util'
import parseUtil from '../common/parseUtil'
import gaUtil from '../common/gaUtil'
import cache from '../common/cache'
import InfiniteScroller from '../common/InfiniteScroller'
// components
import componentHeader from './components/header.vue'
import componentNav from './components/nav.vue'
import componentFooter from './components/footer.vue'
// pages
import pageDetail from './pages/detail.vue'
import pageSearch from './pages/search.vue'
import pageLogin from './pages/login.vue'
import pageTop from './pages/top.vue'
import pageMap from './pages/map.vue'
import pageAbout from './pages/about.vue'
import pageMypageTop from './pages/mypage/top.vue'
import pageMypageEdit from './pages/mypage/edit.vue'

// filter
import {} from './filters/filter'
// zepto
import {} from 'npm-zepto'
import {} from '../lib/zepto.deparam'
import {} from '../lib/zepto.cookie'

// fast click
import FastClick from 'fastclick'

// setup Vue
Vue.config.debug = config.debug
// setup fastclick
new FastClick(document.body)

var app = new Vue({

  el: '#app',

  components: {
    'component-header': componentHeader,
    'component-nav': componentNav,
    'component-footer': componentFooter,
    'page-detail': pageDetail,
    'page-search': pageSearch,
    'page-login': pageLogin,
    'page-top': pageTop,
    'page-map': pageMap,
    'page-about': pageAbout,
    'page-mypage-top': pageMypageTop,
    'page-mypage-edit': pageMypageEdit
  },

  data: {
    currentView: '',
    isMenuOpened: false,
    showLoginModal: false
  },

  created() {
    // called by headear save button
    this.$on('onSave', (componentId) => {
      // e.g. onSave:page-mypage-edit
      this.$broadcast('onSave:' + componentId)
    })
    this.$on('toggleMenu', (opened) => {
      this.isMenuOpened = opened
      this.$broadcast('toggleMenu', opened)
    })
    this.$on('togglePopupQueires', () => {
      this.$broadcast('togglePopupQueires')
    })
    util.getSlideOut().on('beforeclose', () => {
      this.$emit('toggleMenu', false)
    })
    // for queries
    this.$on('onSearchResultsChanged', (obj) => {
      this.$broadcast('onSearchResultsChanged', obj)
    })
    this.$on('onSearchResultsMore', (obj) => {
      this.$broadcast('onSearchResultsMore', obj)
    })
    this.$on('onSearchTagInput', (keyword) => {
      this.$broadcast('onSearchTagInput', keyword)
    })
    this.$on('updateSearchTag', (tag) => {
      this.$broadcast('updateSearchTag', tag)
    })
    this.$on('updateSearchArea', (area) => {
      this.$broadcast('updateSearchArea', area)
    })
    this.$on('clearSearchFilter', () => {
      this.$broadcast('clearSearchFilter')
    })
    this.$on('onBaseQueryConditionChanged', (area) => {
      this.$broadcast('onBaseQueryConditionChanged', area)
    })
    this.$on('prePerformSearch', () => {
      this.$broadcast('prePerformSearch')
    })
    this.$on('performSearch', (additonalQuery) => {
      this.$broadcast('performSearch', additonalQuery)
    })
    // auth to show login modal
    this.$on('showLoginModal', () => {
      this.showLoginModal = true
    })
    this.$on('hideLoginModal', () => {
      this.showLoginModal = false
    })
    // client side route for popup preview photo
    this.$on('onSelectCard', (photo) => {
      util.redirect('#/p/' + photo._id)
    })
  },

  methods: {
    onClickMenuOverlay(e) {
      util.getSlideOut().close()
      e.preventDefault(e)
      return false
    }
  }
})

// setup infinite scroll
app._infiniteScroller = new InfiniteScroller({
  callback() {
    app.$broadcast('onScrollBottom')
  }
})

// init for show/hide login panels
util.init(app)
parseUtil.init(app)

var updateTitle = (titleKey) => {
  // update document title
  var title = labels[titleKey || 'meta_title']
  document.title = title
  // send page view count to GA
  gaUtil.sendPage(location.pathname, title)
}

var onRoute = (componentId, options = {}) => {
  // abort all requests called in previous pages
  util.abortRequests()
  options.componentId = componentId
  var again = app.currentView === componentId
  setTimeout(() => {
    app.$broadcast('onRoute', options)
    // e.g. history back on preview modal
    if (again) {
      app.$broadcast('onRouteAgain', options)
    }
  }, 25)
  app.currentView = componentId
  // show hearder if already hidden by scroll
  util.showHeader()
  updateTitle(options.title)
}

// setup router
var routes = {
  '/': function() {
    onRoute('page-top')
  },
  '/map': function() {
    onRoute('page-map', {title: 'meta_title_map'})
  },
  '/search': function() {
    onRoute('page-search', {title: 'meta_title_search'})
  },
  '/detail/:id': function(id) {
    // title will be set by data loaded
    onRoute('page-detail')
  },
  '/about': function() {
    onRoute('page-about', {title: 'meta_title_about'})
  },
  '/instagramer/:id': function(id) {
    // title will be set by data loaded
    onRoute('page-instagramer')
  },
  '/mypage/top': function() {
    onRoute('page-mypage-top', {title: 'meta_title_mypage'})
  },
  '/mypage/edit': function() {
    onRoute('page-mypage-edit')
  },
  '/p/:id': function(id) {
    // remove last one from history for replace
    cache.get('histories').pop()
    // broadcast here to handle once back from preview and browser next again to preview
    app.$broadcast('showPreivewPhoto', id)
    updateTitle()
  }
}

var router = app.router = Router(routes).configure({
  html5history: true
})

router.init(config.hash || '/')

module.exports = app
