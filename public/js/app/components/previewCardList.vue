<template>
  <div class="component__previewCardList">
    <div class="previewCardList_body">
      <div class="preview_arrow_left" :class="{arrow_disabled: prevDisabled}"><div @click.stop="onClickPrev">{{labels.common_prev}}</div></div>
      <component-preview-card :photo.sync="selectedItem" v-if="selectedItem"></component-preview-card>
      <div class="preview_arrow_right" :class="{arrow_disabled: nextDisabled}"><div @click.stop="onClickNext">{{labels.common_next}}</div></div>
    </div>
  </div>
</template>

<script>
import labels from '../../common/labels'
import ComponentPreviewCard from './previewCard.vue'

export default {

  props: {
    'images': {
      type: Array,
      default() {
        return []
      }
    },
    'selectedItem': {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      labels: labels
    }
  },

  components: {
    'component-preview-card': ComponentPreviewCard
  },

  computed: {
    selectedIndex() {
      return this.images.indexOf(this.selectedItem)
    },

    prevDisabled() {
      return this.selectedIndex === 0
    },

    nextDisabled() {
      return this.selectedIndex === this.images.length - 1
    }

  },

  methods: {
    onClickPrev() {
      if (!this.prevDisabled) {
        this.selectedItem = this.images[this.selectedIndex - 1]
      }
    },

    onClickNext() {
      if (!this.nextDisabled) {
        this.selectedItem = this.images[this.selectedIndex + 1]
      }
    },

    hidePreview() {
      this.$dispatch('onHidePreviewList')
    }
  }
}
</script>