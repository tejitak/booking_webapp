'use strict'
var __ = require('underscore')

// default config is config.development.js
var env = process.env.NODE_ENV || 'development'
var config = {}
try {
  config = require('./config/config.' + env + '.js')
} catch (e) {
  // fallback with env variales
  config = process.env;
}

var extendedConfig = __.extend({}, config)
// define extended config utilities here
// e.g.
// extendedConfig.getCrawlerHost = function() { return this.CRAWLER_HOST || 'localhost' }

 module.exports = extendedConfig