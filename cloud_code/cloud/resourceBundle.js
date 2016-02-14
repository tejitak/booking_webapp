'use strict'
var _ = require('underscore');

// {"default": {...}, "ja": {...}}
var _resources = {
  'default': require('cloud/nls/resources.js'),
  'ja': require('cloud/nls/ja/resources.js'),
  'zh': require('cloud/nls/zh-CN/resources.js'),
  'zh-CN': require('cloud/nls/zh-CN/resources.js'),
  'zh-Hans': require('cloud/nls/zh-CN/resources.js')
};

var resourceBundle = {

  normalizeLocale: function(str) {
    // e.g.
    // zh-CN -> zh-CN
    // en-US -> en
    // for iOS
    // zh-Hans-US -> zh-Hans
    var lr = str.split('-', 2);
    if (!lr[0] || str.indexOf('zh-') === 0) {
      return lr.join('-')
    } else {
      return lr[0].toLowerCase()
    }
  },

  getLocale: function(req, noNormalize) {
    return this.normalizeLocale(req.params && req.params.locale || 'en')
  },

  getLabels: function(req) {
    var locale = this.getLocale(req);
    var localizedLabels = _resources[locale];
    if (localizedLabels) {
      return _.extend({}, _resources["default"], localizedLabels)
    } else {
      return _resources["default"] || {}
    }
  },

  getLabel: function(req, key) {
    return this.getLabels(req)[key] || ''
  }
};

module.exports = resourceBundle;