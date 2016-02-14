import $ from 'npm-zepto'

var globalConfig = (window.OPTION && window.OPTION.config) || {}

// add extra config here if needed

module.exports = $.extend({}, globalConfig)