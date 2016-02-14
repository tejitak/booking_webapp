<template>
  <div class="page__mypage">
    <div class="mypage_head" v-if="me">
      <span class="icon_profile icon_large"><img :src="me.picture_url"></span>
      <div class="mypage_table">
        <div>
          {{me.name}}
        </div>
        <div v-show="status === 'rendered'">
          {{{'mypage_summary' | labelFormat likedPhotoCount listings.length}}}
        </div>
      </div>
      <div class="mypage_head_overlay" :style="{backgroundImage: 'url(' + me.picture_url + ')'}"></div>
    </div>
    <div class="mypage_list">
      <div class="mypage_section" v-for="listing in listings">
        <div class="mypage_section_header" @click="moveToDetail(listing.objectId)">
          <a href="javascript:;">{{listing.name_ja}}</a>
        </div>
        <div class="mypage_photos">
          <div class="mypage_card_wrap" v-for="photo in listing.photos">
            <component-card track-by="objectId" :item="photo"></component-card>
          </div>
        </div>
      </div>
    </div>
    <div class="center_loading" v-show="status !== 'rendered' && listings.length === 0">
      <img src="/img/loading-spin.svg" width="64" height="64">
    </div>
    <div class="top_no_result" v-show="status === 'rendered' && !hasNext && listings.length === 0">
      {{labels.mypage_no_liked_photos}}
    </div>
    <div class="preview_overlay" v-show="selectedPhoto" transition="fade_layer"></div>
    <div class="preview" v-if="selectedPhoto" @click="back" transition="fade">
      <div class="preview_card">
        <component-preview-card :photo.sync="selectedPhoto" :show-restaurant-link="true"></component-preview-card>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'npm-zepto'
import util from '../../../common/util'
import labels from '../../../common/labels'
import parseUtil from '../../../common/parseUtil'
import componentCard from '../../components/card.vue'
import componentPreviewCard from '../../components/previewCard.vue'

export default {
  data() {
    return {
      me: null,
      selectedPhoto: null,
      likedPhotoCount: -1,
      listings: [],
      status: '',
      labels: labels
    }
  },

  components: {
    'component-card': componentCard,
    'component-preview-card': componentPreviewCard
  },

  created() {
    this.$on('showPreivewPhoto', this.showPreviewPhoto.bind(this))
    // hide preview for history back after showing preview
    this.$on('onRouteAgain', this.hidePreview.bind(this))
  },

  attached() {
    this.refresh()
  },

  detached() {
    this.selectedPhoto = null
  },

  computed: {
    displayRestaurantPhotos() {
      return util.flatten(util.pluck(this.listings, 'photos'))
    }
  },

  methods: {
    refresh() {
      // load by no cache to update by like/unlike
      parseUtil.fetchMyPage().then((result) => {
        this.me = result.me
        // show by restaurant section
        this.listings = result.listings
        this.likedPhotoCount = result.likedPhotoCount
        this.status = 'rendered'
      })
    },

    linkUser(type) {
      util.openWindow('/auth/' + type, true/* reloadOnClose */)
    },

    // called by router
    showPreviewPhoto(photoId) {
      this.selectedPhoto = util.getItemById(this.displayRestaurantPhotos, photoId)
    },

    hidePreview() {
      this.selectedPhoto = null
    },

    moveToDetail(restaurantId) {
      util.redirect('#/detail/' + restaurantId)
    },

    back() {
      history.back()
    }
  }
}
</script>