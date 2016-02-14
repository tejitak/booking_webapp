<template>
  <div class="page__mypage isEdit">
    <div class="mypage_head">
      <span class="icon_profile icon_large"><img :src="me.imageUrl"></span>
      <div class="mypage_name">
        <input type="text" v-model="me.name">
      </div>
    </div>
    <div class="mypage_table">
        <dl>
            <dt>{{labels.common_email}}</dt><dd><input type="text" v-model="me.email"></dd>
        </dl>
    </div>
  </div>
</template>

<script>
import config from '../../../common/config'
import util from '../../../common/util'
import labels from '../../../common/labels'

export default {
  data() {
    return {
      labels: labels
    }
  },

  components: {
  },

  created() {
    this.$on('onSave:page-mypage-edit', () => {
      alert('saved')
      // TODO: validation

      // TODO: update info via POST API

      // move back to mypage
      util.redirect('#/mypage/top')
    })
  },

  methods: {
  }
}
</script>