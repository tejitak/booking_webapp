'use strict'
import $ from 'npm-zepto'
import cache from './cache'
import constants from '../../../controllers/constants'

class Query {

  constructor() {
    // params: {
    //   order: '$near', // $near, -rating
    //   area: '_default',
    //   budget: {
    //     // type: '', 'lunch', 'dinner'
    //     type: '',
    //     range: {
    //       low: 0,
    //       high: 30000
    //     }
    //   },
    //   tag: ''
    // }
    this.params = {}
    // no serialized params like $near, $box parameters
    this.additionalQuery = {}
  }

  setParam(params) {
    this.params = params
  }

  toParseQuery() {
    // {"where":{"area":"shibuya","priceRange":"¥3000_¥4000","name":{"$regex":"test","$options":"i"}}}
    var q = {}
    // build where query from params
    // geo query for sort by near
    var currentLocation = cache.get('currentLocation')
    if (!currentLocation) {
      // fail to retrieve location, change order to rating
      this.params.order = '-like_count'
    } else {
      q.near = {'__type': 'GeoPoint', latitude: currentLocation.latitude, longitude: currentLocation.longitude}
    }
    // override near query by area
    if (this.params.area !== constants.blankOptionValue) {
      var areaLatLng = constants.areaCoords[this.params.area]
      q.near = {'__type': 'GeoPoint', latitude: areaLatLng.latitude, longitude: areaLatLng.longitude}
      q.maxDistanceInKilometers = 4
    }
    q.order = this.params.order
    // budget query if type is blank, low and hight will not be send
    if (this.params.budget.type !== '') {
      var budgetParams = this.params.budget
      var budgetType = budgetParams.type
      // specify low
      var lowPriceId = budgetParams.range.low - 0
      if (lowPriceId !== 0) {
        q['price_' + budgetType + '_low'] = constants.PRICE_OPITONS[lowPriceId].value
      }
      // specify high
      var highPriceId = budgetParams.range.high - 0
      if (highPriceId !== 12) {
        q['price_' + budgetType + '_high'] = constants.PRICE_OPITONS[highPriceId].value
      }
    }

    // for time query
    // var nowInfo = filter.util.getNowInfo()
    // check today's day -> check corresponding oh1_<day>_start, oh1_<day>_end
    // TODO: TEMP implementation
    // -16:00 -> query for oh1_ columns as day
    // 16:00- -> query for oh2_ columns as nihgt
    // TODO: check today is holiday -> check oh1_holiday_start, oh1_holiday_end

    // if (this.values.nowOpened) {
    //   // start time
    //   this.queryParams.where[nowInfo.startColumn] = {"$lte": nowInfo.diplayTime}
    //   // end time
    //   this.queryParams.where[nowInfo.endColumn] = {"$gte": nowInfo.diplayTime}
    //   filtered = true
    // } else {
    //   delete this.queryParams.where[nowInfo.startColumn]
    //   delete this.queryParams.where[nowInfo.endColumn]
    // }
    // hashtag search
    if (this.params.tag) {
      q.tags = this.params.tag
    }
    // handling additional queries e.g. limit, box
    q = $.extend({}, q, this.additionalQuery)

    if (q.where) {
      q.where = JSON.stringify(q.where)
      if (q.where === '{}') {
        delete q.where
      }
    }
    return q
  }

  serialize() {
    // for URL addressable
    var params = $.extend({}, this.params)
    // remove unneccesary default values
    if (params.order === '$near') {
      delete params.order
    }
    if (params.area === constants.blankOptionValue) {
      delete params.area
    }
    if (params.budget) {
      if (params.budget.type === '') {
        delete params.budget
      } else if (params.budget.range) {
        if (params.budget.range.low === 0) {
          delete params.budget.low
        }
        if (params.budget.range.high === 12) {
          delete params.budget.high
        }
      }
    }
    if (params.tag === '') {
      delete params.tag
    }
    return JSON.stringify(params)
  }

  getAdditionalQuery() {
    return this.additionalQuery
  }

  setAdditionalQuery(additionalQuery) {
    this.additionalQuery = additionalQuery
  }
}

Query.getInstance = () => {
  if (!Query._instance) {
    Query._instance = new Query()
  }
  return Query._instance
}

export default Query