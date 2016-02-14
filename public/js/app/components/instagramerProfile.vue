<script>
import config from '../../common/config'
import labels from '../../common/labels'
import util from '../../common/util'
import tmpl from '../../../../views/vue/instagramerProfileTmpl'

export default {

  // use server side template
  template: tmpl,

  props: {
    'user': {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      labels: labels
    }
  },

  created() {
  },

  methods: {
  }
}
</script>