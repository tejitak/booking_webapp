<template>
  <div class="page__top" :class="{top_search: isSearch}">
    <div class="top_header">
      <component-filter-info></component-filter-info>
    </div>
    <div class="top_main" v-el:main>
      <div class="top_card_wrap" v-for="photo in displayPhotos">
        <component-card :item="photo" :show-info="true"></component-card>
      </div>
    </div>
    <div class="center_loading" v-show="status !== 'rendered' && displayPhotos.length === 0">
      <img src="/img/loading-spin.svg" width="64" height="64">
    </div>
    <div class="top_no_result" v-show="status === 'rendered' && !hasNext && displayPhotos.length === 0">
    {{labels.top_no_results}}
    </div>
    <div class="loading_more" v-if="displayPhotos.length > 0 && hasNext">
      <img src="/img/loading-spin.svg" width="32" height="32">
    </div>
    <div class="top_float_button_wrap" v-show="status === 'rendered'" @click="onClickMap">
      <span>{{labels.common_map}}</span>
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
import util from '../../common/util'
import config from '../../common/config'
import cache from '../../common/cache'
import labels from '../../common/labels'
import Query from '../../common/Query'
import localStorage from '../../common/localStorage'
import urlQueryParser from '../../common/urlQueryParser'
import componentCard from '../components/card.vue'
import componentPreviewCard from '../components/previewCard.vue'
import componentFilterInfo from '../components/filterInfo.vue'

export default {
  data() {
    return {
      hasNext: true,
      displayPhotos: [],
      queryParams: {
        include: 'photos',
        limit: 20,
        skip: 0
      },
      selectedPhoto: null,
      isSearch: false,
      status: '',
      labels: labels
    }
  },

  components: {
    'component-card': componentCard,
    'component-preview-card': componentPreviewCard,
    'component-filter-info': componentFilterInfo
  },

  created() {
    this.attachEvents()
  },

  computed: {
  },

  attached() {
    this._detached = false
    if (this.displayPhotos.length === 0) {
      this._cachedScrollTop = 0
      this.refresh()
    } else {
      this.status = 'rendered'
    }
    // clear additional query e.g. $near, $box
    Query.getInstance().setAdditionalQuery(null)
    $(window).scrollTop(this._cachedScrollTop || 0)
    this.$root._infiniteScroller.enable()

    // header animation
    var touchWatcher = util.watchMove()
    $(this.$els.main).on('touchstart.top_watch touchmove.top_watch touchcancel.top_watch', util.debouncer(touchWatcher, touchWatcher, 200))
    $(window).on('scroll.top_watch', util.debouncer(null, util.watchScroll, 200))
  },

  detached() {
    this._detached = true
    this.status = ''
    this.selectedPhoto = null
    this._cachedScrollTop = this.$root._infiniteScroller.getLastScrollTop()
    this.$root._infiniteScroller.disable()
    // header animation
    $(this.$els.main).off('.top_watch')
    $(window).off('.top_watch')
  },

  methods: {
    attachEvents() {
      this.$on('showPreivewPhoto', this.showPreviewPhoto.bind(this))
      // hide preview for history back after showing preview
      this.$on('onRouteAgain', this.hidePreview.bind(this))
      this.$on('onScrollBottom', this.loadMore.bind(this))
      this.$on('onSearchResultsChanged', this.onSearchResultsChanged.bind(this))
      this.$on('onSearchResultsMore', this.onSearchResultsMore.bind(this))
      // clear in background while search page is shown
      this.$on('onBaseQueryConditionChanged', this.clear.bind(this))
      this.$on('updateSearchTag', this.onUpdateSearchTag.bind(this))
    },

    clear() {
      this.selectedPhoto = null
      this.displayPhotos = []
      this.status = ''
    },

    // called by router
    showPreviewPhoto(photoId) {
      if (this._detached) { return }
      this.selectedPhoto = util.getItemById(this.displayPhotos, photoId)
    },

    hidePreview() {
      this.selectedPhoto = null
    },

    refresh() {
      // check client GPS location allowed
      if (localStorage.get('hashdish.locationAllowed') === null || !cache.get('currentLocation')) {
        // check location service
        util.getCurrentLocation().then(() => {
          this.performSearch()
        }, () => {
          this.performSearch()
        })
      } else {
        this.performSearch()
      }
    },

    loadMore() {
      if (this._detached || this.status === 'requesting') { return }
      this.queryParams.skip = this.queryParams.skip + this.queryParams.limit
      this.performSearch(true/* more */)
    },

    performSearch(more) {
      this.status = 'requesting'
      this.$dispatch('performSearch', {
        additionalQuery: this.queryParams,
        more: more
      })
    },

    onSearchResultsChanged(response) {
      this.render(response.result)
      return true
    },

    onSearchResultsMore(response) {
      this.render(response.result)
    },

    render(result) {
      if (this._detached) { return }
      var photos = result.photos
      photos.forEach((photo) => {
        this.displayPhotos.push(photo)
      })
      this.hasNext = result.hasNext
      this.status = 'rendered'
    },

    onClickMap() {
      util.redirect('#/map')
    },

    onUpdateSearchTag(tag) {
      // just add class for search
      this.isSearch = tag !== ''
    },

    back() {
      history.back()
    }
  }
}
</script>