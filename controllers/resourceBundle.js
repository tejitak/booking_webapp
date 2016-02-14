'use strict'
var __ = require('underscore');

// {"default": {...}, "ja": {...}}
var _resources = {
  'default': require('../cloud_code/cloud/nls/resources.js'),
  'ja': require('../cloud_code/cloud/nls/ja/resources.js'),
  'zh-CN': require('../cloud_code/cloud/nls/zh-CN/resources.js')
};

var resourceBundle = {

    normalizeLocale(str) {
        // e.g.
        // zh-CN -> zh-CN
        // en-US -> en
        var lr = str.split('-', 2);
        if (!lr[0] || str.indexOf('zh-') === 0) {
            return str
        } else {
            return lr[0].toLowerCase()
        }
    },

    getLocale(req, noNormalize) {
        var languageHeader = req.headers['accept-language'], languages = [], locale = "";
        if (languageHeader) {
            languageHeader.split(',').forEach((l) => {
                var header = l.split(';', 1)[0]
                if (!noNormalize) {
                    header = this.normalizeLocale(header)
                }
                languages.push(header);
            });
            if (languages.length > 0) {
                locale = languages[0];
            }
        }
        return locale;
    },

    getLabels(req) {
        var locale = this.getLocale(req);
        var isSupported = _resources[locale];
        if (isSupported) {
            return __.extend({}, _resources["default"], _resources[locale])
        } else {
            return _resources["default"] || {}
        }
    },

    getLabel(req, key) {
        return this.getLabels(req)[key] || ''
    }
};

module.exports = resourceBundle;
