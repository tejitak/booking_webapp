import Vue from 'vue'
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
import ComponentPreviewCard from '../app/components/previewCard.vue'
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
      'component-preview-card': ComponentPreviewCard
    },

    data: {
      // main
      isMenuOpened: false,
      showLoginModal: false,
      // preview
      item: data.item,
      itemHeight: 0,
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
    },

    ready() {
      // set item height
      setTimeout(() => {
        var $win = $(window)
        var w = $win.width()
        var h = $win.height() - 64 /* haeder */ - 60 /* margin */ - 80 - 40 /* min height of actions + margin */
        this.itemHeight = Math.min(w, h)
      }, 25)
    },

    methods: {
      // main
      onClickMenuOverlay(e) {
        util.getSlideOut().close()
        e.preventDefault(e)
        return false
      },

      shareTwitter() {
        util.shareTwitter()
      },

      shareFacebook() {
        util.shareFacebook()
      },

      shareLine() {
        util.shareLine()
      }
    }
  })

  // init for show/hide login panels
  parseUtil.init(app)

  // fake broadcast for router handled in header
  app.$broadcast('onRoute', {componentId: 'server-detail'})
})

module.exports = app