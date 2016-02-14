'use strict'
// var moment = require('moment')
var constants = require('./constants')

var filter = {

  numberFormat(num) {
    // toLocalString does not supported by safari
    var numStr = String(num)
    var prefix = ''
    if (numStr[0] === '-') {
      prefix = '-'
      numStr = numStr.slice(1, numStr.length)
    }
    return prefix + numStr.split('').reverse().join('').match(/\d{1,3}/g).join(',').split('').reverse().join('')
  },

  labelFormat(key, values, labels) {
    if (!key || !labels[key]) { return '' }
    var label = labels[key]
    values = values || []
    if (!Array.isArray(values)) {
      values = [values]
    }
    for (let i = 0; i < values.length; i++) {
      label = label.replace(new RegExp('\\$\\{' + i + '\\}', 'g'), values[i])
    }
    return label
  },

  // [{label: "ランチ", value: "〜¥999"}, {label: "ディナー", value: "¥3,000〜¥3,999"}]
  displayBudget(arr, labels) {
    if (!arr || arr.length === 0) {
      return '-'
    }
    var html = []
    arr.forEach(function(obj) {
      html.push(obj.label + ' ' + obj.value)
    })
    return html.join('<br>')
  },

  displayNowOpen(value, labels) {
    return value ? labels.common_now_open : ''
  },

  displayTodayOpenHours(displayedOpenHours, labels) {
    var value = ''
    displayedOpenHours.forEach(function(obj) {
      if (obj.today) {
        value = obj.value
      }
    })
    return value
  },

  displayOpenHours(displayedOpenHours, labels) {
    var results = []
    // e.g. {label: "Wednesday", value: "11:30-15:00"}
    displayedOpenHours.forEach(function(obj) {
      var className = obj.today ? 'detail_today' : ''
      var label = `<span class="${className}">${obj.label}</span>`
      var value = `<span class="${className}">${obj.value}</span>`
      results.push(label + ': ' + value)
    })
    return results.join('<br>')
  },

  displayFilterInfo(params, labels) {
    if (!params) {
      return ''
    }
    var strArr = []
    if (params.order !== '$near') {
      strArr.push(filter.labelFormat('filter_sort_by', labels['constants_sort_' + params.order], labels))
    }
    if (params.area !== constants.blankOptionValue) {
      strArr.push(labels['constants_area_JP_tokyo_' + params.area])
    }
    if (params.budget && params.budget.type !== '') {
      var lowPriceText = params.budget.range.low !== 0 ? constants.PRICE_OPITONS[params.budget.range.low].text : ''
      var highPriceText = params.budget.range.high !== Number.MAX_VALUE ? constants.PRICE_OPITONS[params.budget.range.high].text : ''
      strArr.push(labels['constants_budget_type_' + params.budget.type] + ' ' + lowPriceText + ' 〜 ' + highPriceText)
    }
    return strArr.join(', ')
  },

  displayTagLink(tag) {
    const encoded = encodeURIComponent(tag)
    return `/#?q=%7B%22tag%22%3A%22${encoded}%22%7D`
  },

  localizeProp(obj, prop, locale) {
    // e.g. prop: name & locale: ja -> obj['name_ja']
    // if no appropriate prop exist, fallback to English -> Japanese
    return obj[prop + '_' + locale] || obj[prop + '_en'] || obj[prop + '_ja'] || ''
  },

  instagramCount(value) {
    if (value === undefined) { return '' }
    var countStr = filter.numberFormat(value)
    var split = countStr.split(',')
    if (split.length > 1) {
      split.splice(split.length - 1, 1)
      countStr = split.join(',') + 'K'
    }
    return countStr
  }
}

module.exports = filter