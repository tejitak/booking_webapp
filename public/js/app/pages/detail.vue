<template>
  <div class="page__detail" v-el:main>
    <div v-if="initialized && item">
        <div class="detail_location">
            <a href="https://maps.google.com/maps/place/{{item.geo.latitude}}%2C{{item.geo.longitude}}" target="_blank">
              <div class="map togglemap" :style="{backgroundImage: 'url(https://maps.googleapis.com/maps/api/staticmap?scale=2&amp;center=' + item.geo.latitude + '%2C' + item.geo.longitude + '&amp;visual_refresh=true&amp;zoom=13&amp;key=AIzaSyC6jozITVaSd0gm8aLLcL3hp7cq7btwkUc&amp;sensor=false&amp;size=640x400&amp;format=jpg)'}">
              <div class="pin"></div>
              </div>
            </a>
        </div>
        <div class="detail_body">
          <div class="detail_share">
            <ul class="social_icon_wrap">
              <li class="social_icon_fb"><a href="javascript:;" @click="shareFacebook"></a></li>
              <li class="social_icon_tw"><a href="javascript:;" @click="shareTwitter"></a></li>
              <li class="social_icon_line"><a href="javascript:;" @click="shareLine"></a></li>
            </ul>
          </div>
          <component-detail-table :item="item"></component-detail-table>
          <div class="detail_photos">
            <h3>{{labels.detail_title_popular_photos}}</h3>
            <div v-show="item.photos.length">
              <div class="detail_flex">
                <div class="detail_card_wrap" v-for="photo in item.photos">
                  <component-card :item="photo" :columns="3"></component-card>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
    <div class="center_loading" v-if="showLoading">
      <img src="/img/loading-spin.svg" width="64" height="64">
    </div>
    <div class="preview_overlay" v-show="selectedPhoto" transition="fade_layer"></div>
    <div class="preview" v-if="selectedPhoto" transition="fade" @click="back">
      <div class="preview_card">
        <component-preview-card-list :selected-item="selectedPhoto" :images.sync="item.photos"></component-preview-card-list>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'npm-zepto'
import util from '../../common/util'
import config from '../../common/config'
import cache from '../../common/cache'
import labels from '../../common/labels'
import parseUtil from '../../common/parseUtil'
import ComponentCard from '../components/card.vue'
import ComponentPreviewCardList from '../components/previewCardList.vue'
import ComponentDetailTable from '../components/detailTable.vue'
import serverFilter from '../../../../controllers/filter'

export default {

  data() {
    return {
      initialized: false,
      showLoading: false,
      item: {},
      selectedPhoto: null,
      locale: config.locale,
      labels: labels
    }
  },

  components: {
    'component-card': ComponentCard,
    'component-preview-card-list': ComponentPreviewCardList,
    'component-detail-table': ComponentDetailTable
  },

  attached() {
    this._detached = false
    // check exisiting item
    var id = location.pathname.replace('/detail/', '')
    this.load(id)
    // header animation
    $(window).scrollTop(0)
    var touchWatcher = util.watchMove()
    $(this.$els.main).on('touchstart.detail_watch touchmove.detail_watch touchcancel.detail_watch', util.debouncer(touchWatcher, touchWatcher, 200))
    $(window).on('scroll.detail_watch', util.debouncer(null, util.watchScroll, 200))
  },

  created() {
    this.$on('showPreivewPhoto', this.showPreviewPhoto.bind(this))
    // hide preview for history back after showing preview
    this.$on('onRouteAgain', this.hidePreview.bind(this))
  },

  detached() {
    this._detached = true
    this.initialized = false
    // header animation
    $(this.$els.main).off('.detail_watch')
    $(window).off('.detail_watch')
  },

  methods: {
    load(id) {
      if (this.initialized || !id) {
        return
      }
      this.showLoading = true
      parseUtil.fetchListing(id).then((data) => {
        if (!this.$root) { return }
        this.item = data
        // set title
        document.title = this.item.name
        this.initialized = true
        this.showLoading = false
      }, () => {
        this.initialized = true
        this.showLoading = false
      })
    },

    showPreviewPhoto(photoId) {
      if (this._detached) { return }
      this.selectedPhoto = util.getItemById(this.item.photos, photoId)
    },

    hidePreview() {
      this.selectedPhoto = null
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
}
</script>