import Vue from 'vue'
import labels from '../../common/labels'
import filter from '../../../../controllers/filter'

Vue.filter('numberFormat', filter.numberFormat)
Vue.filter('labelFormat', (key, ...values) => {
  return filter.labelFormat(key, values, labels)
})
Vue.filter('displayBudget', (value) => {
  return filter.displayBudget(value, labels)
})
Vue.filter('displayNowOpen', (value) => {
  return filter.displayNowOpen(value, labels)
})
Vue.filter('displayTodayOpenHours', (value) => {
  return filter.displayTodayOpenHours(value, labels)
})
Vue.filter('displayOpenHours', (value) => {
  return filter.displayOpenHours(value, labels)
})
Vue.filter('displayPriceRange', (value) => {
  return filter.displayPriceRange(value, labels)
})
Vue.filter('displayFilterInfo', (query) => {
  return filter.displayFilterInfo(query, labels)
})
Vue.filter('displayTagLink', (value) => {
  return filter.displayTagLink(value, labels)
})
Vue.filter('localizeProp', (prop, locale) => {
  return filter.localizeProp(prop, locale, labels)
})
Vue.filter('instagramCount', (value) => {
  return filter.instagramCount(value, labels)
})
export default filter