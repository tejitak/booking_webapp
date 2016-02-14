import Vue from 'vue'
import {Router} from 'director'
import config from '../common/config'
import labels from '../common/labels'
import util from '../common/util'
import parseUtil from '../common/parseUtil'
import cache from '../common/cache'
import constants from '../../../controllers/constants'
// components
import componentHeader from '../app/components/header.vue'
import componentNav from '../app/components/nav.vue'
import componentFooter from '../app/components/footer.vue'
// pages
import pageLogin from '../app/pages/login.vue'
// detail page compoents
import ComponentCard from '../app/components/card.vue'
import ComponentPreviewCardList from '../app/components/previewCardList.vue'
// filter
import filter from '../app/filters/filter'
// zepto
import $ from 'npm-zepto'
import {} from '../lib/zepto.deparam'
import {} from '../lib/zepto.cookie'
// fast click
import FastClick from 'fastclick'
// setup Vue
Vue.config.debug = config.debug
// setup fastclick
new FastClick(document.body)

var data = window.OPTION.data || {}

var app
$(document).ready(() => {
  app = new Vue({

    el: '#app',

    components: {
      'component-header': componentHeader,
      'component-nav': componentNav,
      'component-footer': componentFooter,
      'page-login': pageLogin,
      'component-card': ComponentCard,
      'component-preview-card-list': ComponentPreviewCardList
    },

    data: {
      // main
      isMenuOpened: false,
      showLoginModal: false,
      // detail
      item: data.item,
      selectedPhoto: null,
      showReadMore: false,
      locale: config.locale
    },

    created() {
      // main
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
      // auth to show login modal
      this.$on('showLoginModal', () => {
        this.showLoginModal = true
      })
      this.$on('hideLoginModal', () => {
        this.showLoginModal = false
      })
      // client side route for popup preview photo
      this.$on('onSelectCard', (photo) => {
        router.setRoute('/p/' + photo.objectId)
      })
      // detail
      // show preview
      this.$on('showPreivewPhoto', (photoId) => {
        this.selectedPhoto = util.getItemById(this.item.photos, photoId)
      })
      // hide preview for history back after showing preview
      this.$on('onRouteAgain', this.hidePreview.bind(this))
    },

    methods: {
      // main
      onClickMenuOverlay(e) {
        util.getSlideOut().close()
        e.preventDefault(e)
        return false
      },

      // detail
      hidePreview() {
        this.selectedPhoto = null
      },

      onClickShowReadMore() {
        this.showReadMore = !this.showReadMore
      },

      shareTwitter() {
        util.shareTwitter()
      },

      shareFacebook() {
        util.shareFacebook()
      },

      shareLine() {
        util.shareLine()
      },

      back() {
        history.back()
      }
    }
  })

  // init for show/hide login panels
  parseUtil.init(app)

  // attach event on server side rendered detail page
  // show / hide read more
  var $showReadMore = $('.detail_readmore_closed')
  var $hideReadMore = $('.detail_readmore_opened')
  var $readMoreContent = $('.detail_readmore_content')
  $showReadMore.on('click', () => {
    $showReadMore.hide()
    $hideReadMore.show()
    $readMoreContent.show()
  })
  $hideReadMore.on('click', () => {
    $showReadMore.show()
    $hideReadMore.hide()
    $readMoreContent.hide()
  })

  // setup router
  var routes = {
    '/detail/:id': function(id) {
      // fake broadcast for router handled in header
      app.$broadcast('onRoute', {componentId: 'server-detail'})
      // e.g. history back on preview modal
      app.$emit('onRouteAgain')
    },
    '/p/:id': function(id) {
      // broadcast here to handle once back from preview and browser next again to preview
      app.$emit('showPreivewPhoto', id)
    },
    '/co/:page': function(page) {
      // fake broadcast for router handled in header
      app.$broadcast('onRoute', {componentId: ''})
    }
  }

  var router = app.router = Router(routes).configure({
    html5history: true
  })
  if (data.item) {
    router.init('/detail/' + data.item.objectId)
  } else {
    router.init(location.pathname)
  }
})

module.exports = app