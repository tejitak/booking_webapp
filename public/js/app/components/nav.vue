<template>
  <a class="nav_logo" href="/">
    <span class="icon_logo_s"></span>
  </a>
  <div class="nav_menu">
    <ul>
      <li v-if="!isLoggedIn"><a @click="login">{{labels.nav_login}}</a></li>
      <li v-if="isLoggedIn" class="nav_profile">
        <a class="icon_profile" @click="move('#/mypage/top')" href="javascript:;">
          <img :src="me && me.picture_url"/>
          <span>{{me && me.name}}</span>
        </a>
      </li>
      <li><a @click="move('#/')">{{labels.nav_explore}}</a></li>
      <li><a @click="move('#/about')">{{labels.nav_about}}</a></li>
      <li v-if="isLoggedIn"><a @click="logout">{{labels.nav_logout}}</a></li>
    </ul>
  </div>
</template>

<script>
import config from '../../common/config'
import labels from '../../common/labels'
import util from '../../common/util'
import parseUtil from '../../common/parseUtil'

export default {

  props: {
    'isServerPage': {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isLoggedIn: false,
      me: null,
      bookings: [],
      labels: labels
    }
  },

  created() {
    this.isLoggedIn = parseUtil.isLoggedIn()
    this.$on('toggleMenu', this.onToggleMenu.bind(this))
  },

  methods: {
    onToggleMenu(opened) {
      if (opened && this.isLoggedIn) {
        parseUtil.fetchMe().then((me) => {
          this.me = me
        }).catch((e) => {
          this.me = null
        })
      }
    },

    move(href) {
      util.getSlideOut().close()
      if (this.isServerPage && href.indexOf('#') === 0) {
        util.redirect('/' + href)
      } else {
        util.redirect(href)
      }
    },

    login() {
      util.getSlideOut().close()
      this.$dispatch('showLoginModal')
    },

    logout() {
      parseUtil.invalidateSession()
      location.href = '/'
    }
  }
}
</script>