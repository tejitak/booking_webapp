<template>
    <a v-on:click="onClickItem" href="javascript:;" class="component__card">
      <div class="card_bg" v-bind:style="{backgroundImage: 'url(' + item.photo_url + ')'}">
        <div class="card_wrap" :style="imgStyle"></div>
        <div class="card_info_wrap" v-show="showInfo">
          <div class="card_info_section">
            <div>
              <span v-if="item.distance">
                <span class="icon_distance"></span>
                <span class="card_info_label">{{item.distance}}</span>
              </span>
              <!--span v-if="item.open_now">
                <span class="icon_open_now"></span>
                <span class="card_info_label">{{labels.common_now_open}}</span>
              </span-->
            </div>
            <div>
              <span v-if="item.like_count">
                <span class="icon_instagram_white_small"></span>
                <span class="card_info_label">{{item.like_count | instagramCount}}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </a>
</template>

<script>
import $ from 'npm-zepto'
import constants from '../../../../controllers/constants'
import util from '../../common/util'
import filter from '../filters/filter'
import labels from '../../common/labels'

export default {

  props: {
    'item': {
      type: Object,
      default: null
    },
    'showInfo': {
      type: Boolean,
      default: false
    },
    'columns': {
      type: Number,
      default: 2
    }
  },

  data() {
    return {
      labels: labels
    }
  },

  created() {
  },

  computed: {
    imgStyle() {
      var $body = $(document.body)
        // max width is 960
      var winW = Math.min($body.width(), 960)
      var columns = this.columns
      // temp for pc responsive, 3 columns layout
      if (util.isPC()) {
        columns = 3
      }
      var w = (winW / columns) - 14 /* card padding */
      return {
        height: w + 'px'
      }
    }
  },

  methods: {
    onClickItem() {
      this.$dispatch('onSelectCard', this.item)
    }
  }
}
</script>