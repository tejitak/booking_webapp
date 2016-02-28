<template>
  <div>
    <div class="component__header">
      <div class="header_wrap header_{{currentComponentId}}">
        <a class="header_logo" href="/"><span class="icon_logo_s"></span></a>
        <a class="button_left {{left.icon}}" v-on:click="leftCallback" v-if="left.icon != 'none'" href="javascript:;">{{{left.label}}}</a>
        <div class="header_title" v-on:click="scrollTop" :style="{visibility: center.hidden ? 'hidden' : 'visible'}">
          <input type="text" v-model="searchTag" placeholder="{{labels.header_search_placeholder}}" @focus="onSearchFocus">
          <a href="javascript:;" class="icon_queries" @click="togglePopupQueires"></a>
          <a href="javascript:;" class="header_search_cancel" @click="back">{{labels.common_cancel}}</a>
        </div>
        <a class="button_right {{right.icon}}" v-on:click="rightCallback" v-if="right.icon != 'none'" href="javascript:;">{{{right.label}}}</a>
        <div class="header_menu">
          <ul>
            <li v-if="!isLoggedIn"><a @click="move('#/about')" href="javascript:;">{{labels.nav_about}}</a></li>
            <li v-if="isLoggedIn"><a @click="move('#/mypage/top')" href="javascript:;">{{labels.nav_mypage}}</a></li>
            <li v-if="!isLoggedIn"><a @click="login" href="javascript:;">{{labels.nav_login}}</a></li>
            <li v-if="isLoggedIn"><a @click="logout" href="javascript:;">{{labels.nav_logout}}</a></li>
          </ul>
        </div>
      </div>
      <div class="header_query_popup" transition="expand" v-show="showPopupQueries">
        <component-queries></component-queries>
      </div>
      <div class="header_popup_overlay popup_overlay_tranparent" v-show="showPopupQueries" @click="togglePopupQueires"></div>
    </div>
    <div class="header_share_popup" v-show="showPopupShare" transition="fade">
      <component-popup>
        <div>
          <ul class="social_icon_wrap">
            <li class="social_icon_fb">
              <a href="javascript:;" @click="shareFacebook">{{labels.sns_fb}}</a>
            </li>
            <li class="social_icon_tw">
              <a href="javascript:;" @click="shareTwitter">{{labels.sns_tw}}</a>
            </li>
            <li class="social_icon_line">
              <a href="javascript:;" @click="shareLine">{{labels.sns_line}}</a>
            </li>
          </ul>
        </div>
      </component-popup>
    </div>
    <div class="header_popup_overlay overlay_all" v-show="showPopupShare" @click="togglePopupShare" transition="fade_layer"></div>
  </div>
</template>

<script>
import config from '../../common/config'
import cache from '../../common/cache'
import util from '../../common/util'
import labels from '../../common/labels'
import Query from '../../common/Query'
import parseUtil from '../../common/parseUtil'
import ComponentQueries from './queries.vue'
import ComponentPopup from './popup.vue'

export default {

  props: {
    'isServerPage': {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      showPopupQueries: false,
      showPopupShare: false,
      center: {
        hidden: false
      },
      left: {
        label: '',
        icon: '',
        callback: null
      },
      right: {
        label: '',
        icon: '',
        callback: null
      },
      isSearchResult: false,
      currentComponentId: '',
      // header menus
      labels: labels,
      isLoggedIn: false,
      me: null
    }
  },

  components: {
    'component-queries': ComponentQueries,
    'component-popup': ComponentPopup
  },

  computed: {
    leftCallback() {
      return this.left.callback || function () {}
    },

    rightCallback() {
      return this.right.callback || function () {}
    }
  },

  created() {
    this.$on('onRoute', (options) => {
      // FIXME: close opened popup
      this.showPopupQueries = false
      this.showPopupShare = false
      this.updateHeader(options.componentId)
    })
    this.$on('togglePopupQueires', this.togglePopupQueires.bind(this))
    this.isLoggedIn = parseUtil.isLoggedIn()
  },

  methods: {
    iconDefaultLeft() {
      var that = this
      return {
        icon: 'icon_menu',
        callback: that.toggleMenu
      }
    },

    iconNone() {
      return {
        icon: 'none'
      }
    },

    iconMap() {
      var that = this
      return {
        icon: 'icon_map',
        callback() {
          that.move('#/map')
        }
      }
    },

    iconQueries() {
      var that = this
      return {
        icon: 'icon_queries',
        callback() {
          // show queries popup
          that.togglePopupQueires()
        }
      }
    },

    iconShare() {
      var that = this
      return {
        icon: 'icon_share',
        callback() {
          that.togglePopupShare()
        }
      }
    },

    // iconList() {
    //   return {
    //     icon: 'icon_list',
    //     callback() {
    //       this.move('#/')
    //     }
    //   }
    // },

    updateHeader(componentId) {
      var that = this
      switch (componentId) {
        case 'page-login':
          this.center = { hidden: false }
          this.left = { icon: 'none' }
          this.right = {
            icon: 'icon_close',
            callback: this.back
          }
          break
        case 'page-top':
          this.center = { hidden: false }
          this.left = this.iconDefaultLeft()
          this.right = this.iconQueries()
          break
        case 'page-map':
          this.center = { hidden: false }
          this.left = this.iconDefaultLeft()
          this.right = this.iconQueries()
          break
        case 'page-search':
          this.center = { hidden: false }
          this.left = this.iconNone()
          this.right = {
            label: labels.common_cancel,
            callback: this.back
          }
          break
        case 'page-detail':
          this.center = { hidden: false }
          this.left = {
            icon: 'icon_back',
            callback: this.back
          }
          this.right = this.iconShare()
          break
        case 'page-mypage-top':
          this.center = { hidden: false }
          this.left = this.iconDefaultLeft()
          this.right = this.iconNone()
          // this.right = {
          //   label: labels.common_edit,
          //   callback() {
          //     this.move('#/mypage/edit')
          //   }
          // }
          break
        case 'page-mypage-edit':
          this.center = { hidden: false }
          this.left = {
            icon: 'icon_back',
            callback() {
              this.move('#/mypage/top')
            }
          }
          this.right = {
            label: labels.common_save,
            callback() {
              that.onSave(componentId)
            }
          }
          break
        case 'page-instagramer':
          this.center = { hidden: false }
          if (cache.get('histories').length === 0) {
            this.left = this.iconDefaultLeft()
          } else {
            this.left = {
              icon: 'icon_back',
              callback: this.back
            }
          }
          this.right = this.iconShare()
          break
        case 'server-detail':
          this.center = { hidden: false }
          this.left = this.iconDefaultLeft()
          this.right = this.iconShare()
          break
        default:
          this.center = { hidden: false }
          this.left = this.iconDefaultLeft()
          this.right = this.iconNone()
          break
      }
      // save the component id
      this.currentComponentId = componentId
    },

    togglePopupQueires() {
      this.showPopupQueries = !this.showPopupQueries
    },

    togglePopupShare() {
      this.showPopupShare = !this.showPopupShare
    },

    toggleMenu() {
      var slideout = util.getSlideOut()
      slideout.toggle()
      this.$dispatch('toggleMenu', slideout.isOpen())
    },

    back() {
      history.back()
    },

    onSearchFocus() {
      this.move('#/search')
    },

    onSave(componentId) {
      this.$dispatch('onSave', componentId)
    },

    scrollTop() {
      util.scrollTo(document.body, 0, 200)
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

    move(href) {
      if (this.isServerPage && href.indexOf('#') === 0) {
        util.redirect('/' + href)
      } else {
        util.redirect(href)
      }
    },

    login() {
      this.$dispatch('showLoginModal')
    },

    logout() {
      parseUtil.invalidateSession()
      location.href = '/'
    }
  }
}
</script>