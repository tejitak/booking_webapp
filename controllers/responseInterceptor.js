'use strict'
var __ = require('underscore');
var config = require('../config');
var resourceBundle = require('../controllers/resourceBundle');
var constants = require('../controllers/constants');
var filter = require('../controllers/filter');

module.exports = {

  render(req, res, view, resObj) {
    // add nls messages
    const labels = resourceBundle.getLabels(req)
    resObj = resObj || {}
    resObj.loginUser = req.user || {}
    resObj.locale = resourceBundle.getLocale(req)
    resObj.labels = labels
    resObj.constants = constants
    resObj.filter = filter
    resObj.jsFile = resObj.jsFile || 'app.js'
    resObj.meta = __.extend({
      title: labels.meta_title,
      description: labels.meta_description,
      keywords: labels.meta_keywords,
      url: 'https://hashdish.com' + req.path,
      image: 'https://hashdish.com/img/ogp.png'
    }, resObj.meta)
    resObj.title = resObj.title || resObj.labels.meta_title
    resObj.subTitle = resObj.subTitle || ''
    // for any params which can check undefined in templates
    // e.g. <% if (data.restaurant) %>
    resObj.data = resObj.data || {}
    resObj.hash = resObj.hash || ''
    resObj.api = {
      // url: 'https://api.parse.com/1'
      url: '/api/v1'
    }
    resObj.preLoadData = resObj.preLoadData || null
    resObj.debugParams = resObj.debugParams || null
    if (view === 'index') {
      res.render('app/index', resObj)
    } else {
      // switch pc/mobile by ua
      var ua = req.header('user-agent');
      // if (/mobile/i.test(ua)) {
          res.render('sp/' + view, resObj);
      // } else {
      //     res.render('pc/' + view, resObj);
      // }
    }
  }
}