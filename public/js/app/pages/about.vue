<template>
  <div class="page__about">
    <div class="about_titleWrap">
      <h2 class="about_title">{{labels.about_title}}</h2>
      <div>{{labels.about_desc1}}</div>
    </div>
    <div class="about_content">
      <div class="about_description">
      {{labels.about_desc2}}
      </div>
    </div>
  </div>
</template>

<script>
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
  }
}
</script>