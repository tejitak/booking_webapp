<template>
  <div class="page__search">
    <div class="search_tabbar_wrap">
      <ul>
        <li :class="{'tab_selected': selectedTab === ''}" @click="onClickTab('')"><span class="icon_search_all" :class="{'icon_search_all_selected': selectedTab === ''}"></span></li>
        <li :class="{'tab_selected': selectedTab === 'Restaurant'}" @click="onClickTab('Restaurant')"><span class="icon_search_pin" :class="{'icon_search_pin_selected': selectedTab === 'Restaurant'}"></span></li>
        <li :class="{'tab_selected': selectedTab === 'Tag'}" @click="onClickTab('Tag')"><span class="icon_search_tag" :class="{'icon_search_tag_selected': selectedTab === 'Tag'}"></span></li>
        <li :class="{'tab_selected': selectedTab === 'Instagramer'}" @click="onClickTab('Instagramer')"><span class="icon_search_instagramer" :class="{'icon_search_instagramer_selected': selectedTab === 'Instagramer'}"></span></li>
      </ul>
    </div>
    <div class="search_result" v-show="suggestions.length > 0">
      <component-suggestion-item v-for="suggestion in suggestions" :item="suggestion"></component-suggestion-item>
    </div>
    <div class="search_loading" v-show="status === 'requesting' && suggestions.length === 0">
      <img src="/img/loading-spin.svg" width="64" height="64">
    </div>
    <div class="search_no_result" v-show="status === 'rendered' && suggestions.length === 0">
      {{labels.search_no_results}}
    </div>
  </div>
</template>

<script>
import config from '../../common/config'
import cache from '../../common/cache'
import util from '../../common/util'
import labels from '../../common/labels'
import filter from '../filters/filter'
import parseUtil from '../../common/parseUtil'
import ComponentSuggestionItem from '../../app/components/suggestionItem.vue'

export default {

  data() {
    return {
      status: '', // requesting, rendered
      selectedTab: '',
      suggestions: [],
      queryParams: {
        keyword: ''
      },
      labels: labels
    }
  },

  created() {
    this.$on('onSearchTagInput', this.onSearchTagInput.bind(this))
    this.$on('onSuggestionItemClicked', this.onSuggestionItemClicked.bind(this))
  },

  attached() {
    this.clearParams()
    this.clearResutls()
  },

  detached() {
    this.status = ''
  },

  components: {
    'component-suggestion-item': ComponentSuggestionItem
  },

  methods: {
    clearParams() {
      this.$dispatch('updateSearchTag', '')
      // always clear search value when the search page is opened
      this.queryParams.keyword = ''
      this.status = ''
    },

    clearResutls() {
      this.suggestions = []
      this.status = ''
    },

    onSearchTagInput(keyword) {
      if (keyword === '') {
        this.clearResutls()
      } else {
        this.queryParams.keyword = keyword
        this.fetch().then(this.render.bind(this))
      }
    },

    fetch() {
      // abort current requests
      util.abortRequests()
      this.status = 'requesting'
      var params = {
        type: this.selectedTab,
        keyword: this.queryParams.keyword
      }
      return parseUtil.fetchSuggestions(params)
    },

    render(suggestions) {
      // care delete all characters after requests
      if (this.queryParams.keyword !== '') {
        this.suggestions = suggestions
        this.status = 'rendered'
      } else {
        this.status = ''
      }
    },

    onClickTab(type) {
      if (this.selectedTab !== type) {
        this.selectedTab = type
        this.clearResutls()
        if (this.queryParams.keyword !== '') {
          this.fetch().then(this.render.bind(this))
        }
      }
    },

    onSuggestionItemClicked(item) {
      if (item.type === 'Tag') {
        this.$dispatch('updateSearchTag', item.value)
        // check prev page was map view
        var histories = cache.get('histories')
        var next = histories[histories.length - 2] === '#/map' ? '#/map' : '#/'
        util.redirect(next)
      } else if (item.type === 'Restaurant') {
        // move to resturant detail
        this.$dispatch('updateSearchTag', '')
        util.redirect('#/detail/' + item.restaurant.objectId)
      } else if (item.type === 'Instagramer') {
        // move to instagramer detail
        this.$dispatch('updateSearchTag', '')
        util.redirect('#/instagramer/' + item.objectId)
      }
    }
  }
}
</script>