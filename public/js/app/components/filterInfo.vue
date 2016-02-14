]<template>
  <div class="component__filterInfo" v-show="query | displayFilterInfo">
    <div class="filterInfo" @click="onClickFilterInfo">
      <span>{{query | displayFilterInfo}}</span>
    </div>
    <div class="filterInfo_clear" @click="onClearFilter">
      <span class="icon_clear"></span>
    </div>
  </div>
</template>

<script>
import util from '../../common/util'
import Query from '../../common/Query'

export default {
  data() {
    return {
      query: null
    }
  },

  computed: {
  },

  created() {
    this.$on('onSearchResultsChanged', this.onSearchResultsChanged.bind(this))
  },

  methods: {
    onSearchResultsChanged(obj) {
      // romove two way binding
      this.query = util.simpleDeepClone(Query.getInstance().params)
    },

    onClickFilterInfo() {
      this.$dispatch('togglePopupQueires')
    },

    onClearFilter() {
      this.query = null
      this.$dispatch('clearSearchFilter')
    }
  }
}
</script>