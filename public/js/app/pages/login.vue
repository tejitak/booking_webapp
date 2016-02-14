<template>
  <div class="page__login">
    <a class="layer_close_icon_wrap" href="javascript:;" @click="close"><span class="icon_close"></span></a>
    <div class="login_body">
      <div class="login_titleWrap">
        <h2 class="login_title">{{labels.login_title}}</h2>
        <div></div>
      </div>
      <div class="login_content">
        <div class="login_description"></div>
        <div class="login_btnWrap">
          <div>
            <a class="FbBtn" v-on:click="onClickSocialLogin('facebook')">
               <div class="FbBtnLabel">{{labels.login_fb_btn}}</div>
            </a>
          </div>
          <div>
            <a class="TwBtn" v-on:click="onClickSocialLogin('twitter')">
              <div class="TwBtnLabel">{{labels.login_tw_btn}}</div>
            </a>
          </div>
        </div>
        <div class="login_note">
          <small>{{labels.login_note}}</small>
        </div>
        <div class="login_terms">
          <small><a href="/co/terms" target="_blank">Terms &amp; Conditions</a></small>
          <small><a href="/co/privacy" target="_blank">Privacy Policy</a></small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import config from '../../common/config'
import util from '../../common/util'
import cache from '../../common/cache'
import labels from '../../common/labels'

export default {
  data() {
    return {
      labels: labels
    }
  },

  components: {
  },

  created() {
  },

  methods: {
    onClickSocialLogin(type) {
      util.openWindow('/auth/' + type, true/* reloadOnClose */)
    },

    close() {
      this.$dispatch('hideLoginModal')
    }
  }
}
</script>