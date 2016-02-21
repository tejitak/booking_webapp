<template>
  <div class="page__search">
    <div class="search_tabbar_wrap">
      <ins class="bookingaff" data-aid="948362" data-target_aid="919217" data-prod="nsb" data-width="300" data-height="250">
        <!-- Anything inside will go away once widget is loaded. -->
        <a href="//www.booking.com?aid=919217">Booking.com</a>
      </ins>
  </div>
</template>

<script>
import config from '../../common/config'
import cache from '../../common/cache'
import util from '../../common/util'
import labels from '../../common/labels'
import filter from '../filters/filter'
import parseUtil from '../../common/parseUtil'

export default {

  data() {
    return {
      labels: labels
    }
  },

  created() {
  },

  ready () {
    (function(d, sc, u) {
      var s = d.createElement(sc), p = d.getElementsByTagName(sc)[0];
      s.type = 'text/javascript';
      s.async = true;
      s.src = u + '?v=' + (+new Date());
      p.parentNode.insertBefore(s,p);
      })(document, 'script', '//aff.bstatic.com/static/affiliate_base/js/flexiproduct.js');
  },

  attached() {
  },

  detached() {
  },

  components: {
  },

  methods: {
  }
}
</script>