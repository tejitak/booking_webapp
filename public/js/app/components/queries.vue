<template>
  <div class="component__queries">
    <div class="queries_form">
      <div class="queries_row">
        <div class="queries_row_label">
          <label>{{labels.queries_area}}</label>
        </div>
        <div>
          <select v-model="query.params.area">
            <option v-for="option in options.area" :value="option.value">{{option.text}}</option>
          </select>
        </div>
      </div>
      <div class="queries_row">
        <div class="queries_row_label">
          <label>{{labels.queries_sort}}</label>
        </div>
        <div>
          <select v-model="query.params.order" @change="onChangeOrder">
            <option v-for="option in options.order" :value="option.value">{{option.text}}</option>
          </select>
        </div>
      </div>
      <div class="queries_row">
        <div class="queries_row_label">
          <label>{{labels.queries_budget_range}}</label>
        </div>
        <div class="queries_budget_type_wrap">
          <input type="button" value="{{labels.queries_budget_range_lunch}}" @click="onClickBudgetType('lunch')" :class="{budget_type_selected: query.params.budget.type === 'lunch'}" />
          <input type="button" value="{{labels.queries_budget_range_dinner}}" @click="onClickBudgetType('dinner')" :class="{budget_type_selected: query.params.budget.type === 'dinner'}" />
        </div>
        <div class="queries_budget_slider_wrap">
          <div v-el:range-slider></div>
        </div>
      </div>
    </div>
    <div class="queries_footer">
      <div class="btn_submit_queries btn_large" v-on:click="onClickSubmitBtn">{{labels.common_done}}</div>
    </div>
  </div>
</template>

<script>
import $ from 'npm-zepto'
import noUiSlider from 'nouislider'
import config from '../../common/config'
import cache from '../../common/cache'
import labels from '../../common/labels'
import util from '../../common/util'
import Query from '../../common/Query'
import urlQueryParser from '../../common/urlQueryParser'
import parseUtil from '../../common/parseUtil'
import filter from '../filters/filter'
import constants from '../../../../controllers/constants'

export default {
  data() {
    var areaOptions = $.map(constants.areaOptions.tokyo, (areaId) => {
      return {value: areaId, text: labels['constants_area_JP_tokyo_' + areaId]}
    })
    return {
      disableSortByNear: false,
      options: {
        order: [
          {value: '$near', text: labels.queries_sort_by_distance},
          {value: '-like_count', text: labels.queries_sort_by_like_count},
          {value: '-rating', text: labels.queries_sort_by_rating}
        ],
        area: [{value: constants.blankOptionValue, text: labels.queries_area_all}].concat(areaOptions)
      },
      // initialize restaurantQuery with default params and URL addressable params
      query: {
        params: $.extend({}, this.defaultQuery(), urlQueryParser.getUrlSearchQueryParams())
      },
      // use for submit button
      // to reload main views when search condition is changed
      prevBaseQueryStr: '{}',
      labels: labels
    }
  },

  created () {
    // setup initial query object
    Query.getInstance().setParam(this.query.params)
    // TODO: disable sort options when user does not allow location service
    // this.disableSortByNear = false

    // listen events
    this.$on('updateSearchTag', this.updateSearchTag.bind(this))
    this.$on('updateSearchArea', this.updateSearchArea.bind(this))
    this.$on('performSearch', this._performSearch.bind(this))
    this.$on('clearSearchFilter', this.clearSearchFilter.bind(this))
  },

  ready () {
    // dispatch to head search input box
    if (this.query.params.tag) {
      // FIXME: delay for listening in top view
      setTimeout(() => {
        this.$dispatch('updateSearchTag', this.query.params.tag)
      }, 50)
    }
    this.initalizePriceRangeSlider()
  },

  methods: {
    defaultQuery () {
      return {
        order: '$near',
        area: constants.blankOptionValue,
        budget: {
          // type: '', 'lunch', 'dinner'
          type: '',
          range: {
            low: 0,
            high: 12
          }
        },
        tag: ''
      }
    },

    initalizePriceRangeSlider () {
      var budget = this.query.params.budget
      var rangeSlider = this._rangeSlider = noUiSlider.create(this.$els.rangeSlider, {
        start: [budget.range.low, budget.range.high],
        connect: true,
        step: 1,
        range: {
          'min': 0,
          'max': 12
        },
        tooltips: true,
        format: {
          to(value) {
            if (value === undefined) { return ''}
            // convert id to price
            return constants.PRICE_OPITONS[value].text
          },
          from(value) {
            return value
          }
        }
      })
      rangeSlider.on('update', (values, handle, orgValues) => {
        // 0 -> low or 1-> high
        var prop = ['low', 'high'][handle]
        // convet ¥4,000 -> index 4 and update v-model
        this.query.params.budget.range[prop] = orgValues[handle]
      })
      // set intial value by URL addressable, convert price to id
      this.updateBudgetSliderStatus()
    },

    onClickBudgetType (type) {
      var currentType = this.query.params.budget.type
      // clear selection
      this.query.params.budget.type = ''
      if (type !== '' && currentType !== type) {
        // select when the type is different from current selection
        this.query.params.budget.type = type
      }
      // update slider status
      this.updateBudgetSliderStatus()
    },

    updateBudgetSliderStatus () {
      var budget = this.query.params.budget
      // this._rangeSlider.set([budget.range.low, budget.range.high])
      if (budget.type === '') {
        this.$els.rangeSlider.setAttribute('disabled', true)
      } else {
        this.$els.rangeSlider.removeAttribute('disabled')
      }
      // update low & high values for clear query filter
      this._rangeSlider.set([budget.range.low, budget.range.high])
    },

    updateSearchTag (tag) {
      this.query.params.tag = tag
      this.dispatchBaseQueryConditionChanged()
    },

    updateSearchArea (area) {
      this.query.params.area = area
      this.dispatchBaseQueryConditionChanged()
    },

    onClickSubmitBtn () {
      // fire event to hide popup in parent
      // for prevent callgin by this self
      this.$dispatch('prePerformSearch')
      this._performSearch({
        additionalQuery: Query.getInstance().getAdditionalQuery()
      })
    },

    dispatchBaseQueryConditionChanged () {
      this.$dispatch('onBaseQueryConditionChanged')
    },

    clearSearchFilter (clearTag) {
      // do not assign directly due to preventing remove references in query
      // this.query.params = this.defaultQuery()
      var tag = this.query.params.tag
      $.extend(this.query.params, this.defaultQuery())
      // keep tag keyword even by clear filter
      // e.g. search by tag and specify sort order, then clear filter -> applying tag
      if (!clearTag) {
        this.query.params.tag = tag
      }
      // update slider when price range type is changed
      this.updateBudgetSliderStatus()
      this.onClickSubmitBtn()
    },

    _performSearch (params = {}) {
      var baseQueryStr = Query.getInstance().serialize()
      if (this.prevBaseQueryStr !== baseQueryStr) {
        this.dispatchBaseQueryConditionChanged()
        // save base query (not include additional query)
        this.prevBaseQueryStr = baseQueryStr
      }
      // store to URL for URL addressable
      util.updateHashByQuery()
      // perform search
      var query = Query.getInstance()
      // save the additionalQuery for next search by submit button
      query.setAdditionalQuery(params.additionalQuery)
      var q = query.toParseQuery()
      var eventKey = params.more ? 'onSearchResultsMore' : 'onSearchResultsChanged'
      parseUtil.fetchPhotoList(q).then((result) => {
        this.$dispatch(eventKey, {
          error: null,
          result: result,
          params: params
        })
      }, (err) => {
        this.$dispatch(eventKey, {
          error: err,
          result: {hasNext: false, photos: []},
          params: params
        })
      })
    },

    onChangeOrder () {
      if (!cache.get('currentLocation')) {
        alert(labels.warning_location_service_off)
        setTimeout(() => {
          this.query.params.order = '-rating'
        })
      }
    }
  }
}
</script>