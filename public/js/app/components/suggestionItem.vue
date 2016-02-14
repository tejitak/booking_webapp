<template>
  <a v-on:click="onClickItem" href="javascript:;" class="component__suggestionItem">
    <div class="suggestion_wrap">
      <div class="suggestion_type_icon"><span class="{{icon}}"></span></div>
      <div class="suggestion_text">
        <h4>{{item.name}}</h4>
        <small>{{item.description}}</small>
      </div>
    </div>
  </a>
</template>

<script>
import constants from '../../../../controllers/constants'
import filter from '../filters/filter'

export default {

  props: {
    'item': {
      type: Object,
      default: {}
    }
  },

  data() {
    return {
    }
  },

  computed: {
    icon() {
      switch (this.item.type) {
        case 'Tag':
          return 'icon_search_tag'
        case 'Restaurant':
          return 'icon_search_pin'
        case 'Instagramer':
          return 'icon_search_instagramer'
        default:
          return ''
      }
    }
  },

  methods: {
    onClickItem() {
      if (this.item) {
        this.$dispatch('onSuggestionItemClicked', this.item)
      }
    }
  }
}
</script>