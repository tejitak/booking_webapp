<script>
import config from '../../common/config'
import labels from '../../common/labels'
import util from '../../common/util'
import tmpl from '../../../../views/vue/detailTableTmpl'

export default {

  // use server side template
  template: tmpl,

  props: {
    'item': {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      showReadMore: false,
      labels: labels
    }
  },

  created() {
    // hide detail by default
    this.showReadMore = false
  },

  methods: {
    onClickShowReadMore() {
      this.showReadMore = !this.showReadMore
    }
  }
}
</script>