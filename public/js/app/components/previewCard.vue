<template>
  <div class="component__previewCard" v-if="photo">
    <a class="layer_close_icon_wrap" href="javascript:;"><span class="icon_close"></span></a>
    <div class="card_bg" :style="previewStyle">
      <div class="card_info_wrap">
        <div class="card_info_section">
          <div>
            <span v-if="photo.distance">
              <span class="icon_distance"></span>
              <span class="card_info_label">{{photo.distance}}</span>
            </span>
            <span v-if="photo.open_now">
              <span class="icon_open_now"></span>
              <span class="card_info_label">{{labels.common_now_open}}</span>
            </span>
          </div>
          <div>
            <span v-if="photo.like_count">
              <span class="icon_instagram_white_small"></span>
              <span class="card_info_label">{{photo.like_count | instagramCount}}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="card_info">
      <span>{{photo.name}}</span>
    </div>
    <div class="card_text">
      <a href="javascript:;" @click.stop="onClickAddress(photo.address)">
        {{address}}
      </a>
    </div>
    <div class="card_actions" v-el:card-actions>
      <div class="card_actions_inner">
        <hr>
        <div class="card_action_left">
          <a href="javascript:;" class="favorite_wrap" @click.stop="onClickLike" v-show="!photo.likedByMe">
            <span class="icon_favorite_blank"></span>
          </a>
          <a href="javascript:;" class="favorite_wrap" @click.stop="onClickUnlike" v-show="photo.likedByMe">
            <span class="icon_favorite"></span>
          </a>
        </div>
        <a href="javascript:;" class="card_action_right" @click.stop="onClickListingLink" v-show="showRestaurantLink">
          <span>{{labels.preview_link_restaurant}}</span>
          <span class="icon_forward"></span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'npm-zepto'
import constants from '../../../../controllers/constants'
import filter from '../../../../controllers/filter'
import config from '../../common/config'
import cache from '../../common/cache'
import util from '../../common/util'
import labels from '../../common/labels'
import parseUtil from '../../common/parseUtil'
import Query from '../../common/Query'

export default {

  props: {
    'photo': {
      type: Object,
      default: null
    },
    'height': {
      type: Number,
      default: 0
    },
    'showRestaurantLink': {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      labels: labels
    }
  },

  computed: {
    previewStyle() {
      if (this.height) {
        return {
          width: this.height + 'px',
          height: this.height + 'px',
          backgroundImage: 'url(' + this.photo.photos[0].url + ')'
        }
      } else {
        var $win = $(window)
        var w = ($win.width() || 320)
        var h = $win.height() - 80 - 40 /* min height of actions + margin */
        var len = Math.min(w, h)
        return {
          backgroundImage: 'url(' + this.photo.photos[0].url + ')',
          width: len + 'px',
          height: len + 'px'
        }
      }
    }
  },

  methods: {
    onClickListingLink() {
      // move to detail page without cache
      util.redirect('#/detail/' + this.photo._id, true/* replace */)
    },

    onClickLike() {
      // update like button state before complete
      this.photo.likedByMe = true
      parseUtil.like(this.photo._id).then(() => {
        // do nothing for success
        this.$dispatch('onLike', this.photo)
      }, () => {
        // revert UI state change by error
        this.photo.likedByMe = false
      })
    },

    onClickUnlike() {
      // update like button state before complete
      this.photo.likedByMe = false
      parseUtil.unlike(this.photo._id).then(() => {
        // do nothing for success
        this.$dispatch('onUnlike', this.photo)
      }, () => {
        // revert UI state change by error
        this.photo.likedByMe = true
      })
    },

    onClickTagLink(tag) {
      location.href = filter.displayTagLink(tag)
    },

    onClickProfile(instagramerId) {
      util.redirect('#/instagramer/' + instagramerId, true/* replace */)
    }
  }
}
</script>