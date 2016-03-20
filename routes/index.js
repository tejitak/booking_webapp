'use strict'
const express = require('express')
const parseCtrl = require('../controllers/parseCtrl')
const constants = require('../controllers/constants');
const filter = require('../controllers/filter');
const resourceBundle = require('../controllers/resourceBundle')
const responseInterceptor = require('../controllers/responseInterceptor')
const vueServer = require('vue-server')
const detailTmpl = require('../views/vue/detailTableTmpl');

const router = express.Router()
const Vue = new vueServer.renderer()

/* GET home page. */
router.get('/', (req, res, next) => {
  // for debug to show face detected photos
  var debugParams = null
  if (req.query['scan_result']) {
    debugParams = { scan_result: req.query['scan_result'] }
  }
  responseInterceptor.render(req, res, 'index', { 
    locale: resourceBundle.getLocale(req),
    debugParams: debugParams
  })
})

router.get('/map', (req, res, next) => {
  responseInterceptor.render(req, res, 'index', { 
    locale: resourceBundle.getLocale(req),
    hash: req.path
  })
})

router.get('/search', (req, res, next) => {
  responseInterceptor.render(req, res, 'index', { 
    locale: resourceBundle.getLocale(req),
    hash: req.path
  })
})

router.get('/about', (req, res, next) => {
  responseInterceptor.render(req, res, 'index', { 
    locale: resourceBundle.getLocale(req),
    hash: req.path
  })
})

router.get('/mypage/top', (req, res, next) => {
  responseInterceptor.render(req, res, 'index', { 
    locale: resourceBundle.getLocale(req),
    hash: req.path
  })
})

/* for google bot */
router.get('/mobile', (req, res, next) => {
  res.redirect('/')
})

/* GET detail page. */
router.get('/detail/:id', (req, res, next) => {
  const id = req.params['id']
  // return 404
  if(!id) { return next() }

  // get specific detail information from parse cloud code
  const fetch = () => {
    return new Promise((resolve, reject) => {
      const options = {
        sessionToken: req.cookies[constants.cookieNames.session]
      }
      parseCtrl.run('restaurant_detail', options, {
        restaurantId: id,
        locale: resourceBundle.getLocale(req)
      }, (err, response) => {
        err ? reject(err) : resolve(response.result)
      })
    })
  }

  // server side rendering
  const renderer = (item) => {
    return new Promise((resolve, reject) => {
      const labels = resourceBundle.getLabels(req)
      const vm = new Vue({
        template: detailTmpl,
        data() {
          return {
            item: item,
            labels: labels
          }
        },
        filters: {
        }
      })
      vm.$on('vueServer.htmlReady', (html) => {
        resolve({html: html, item: item})
      })
    })
  }

  fetch().then(renderer).then((obj) => {
    const locale = resourceBundle.getLocale(req),
      labels = resourceBundle.getLabels(req),
      item = obj.item
    responseInterceptor.render(req, res, 'detail', { 
      locale: locale,
      jsFile: 'sp_detail.js',
      html: obj.html,
      data: {
        item: item
      },
      meta: {
        title: filter.labelFormat('meta_title_detail', [item['name_ja'], item['name_en']], labels),
        keywords: item.tags || '',
        image: item.photos.length > 0 ? item.photos[0].photo_url : ''
      }
    })
  }).catch((err) => {
    return next(err)
  })
})

/* GET photo preview page. */
router.get('/p/:id', (req, res, next) => {
  const id = req.params['id']
  // return 404
  if(!id) { return next() }

  // get specific detail information from parse cloud code
  const fetch = () => {
    return new Promise((resolve, reject) => {
      const options = {
        sessionToken: req.cookies[constants.cookieNames.session]
      }
      parseCtrl.run('photo_detail', options, {
        photoId: id,
        locale: resourceBundle.getLocale(req)
      }, (err, response) => {
        err ? reject(err) : resolve(response.result)
      })
    })
  }

  fetch().then((item) => {
    const locale = resourceBundle.getLocale(req),
      labels = resourceBundle.getLabels(req)
    responseInterceptor.render(req, res, 'preview', { 
      locale: locale,
      jsFile: 'sp_preview.js',
      data: {
        item: item
      },
      meta: {
        keywords: item.tags,
        image: item.url_l
      }
    })
  }).catch((err) => {
    return next(err)
  })
})

// company information e.g. terms, privacy, company
router.get('/co/:page', (req, res, next) => {
  var page = req.params.page
  var title = resourceBundle.getLabel(req, 'title_co_' + page)
  var desc = resourceBundle.getLabel(req, 'description_co_' + page)
  responseInterceptor.render(req, res, 'co/' + page, { 
    jsFile: 'sp_detail.js',
    locale: resourceBundle.getLocale(req),
    meta: {
      title: title,
      description: desc
    },
    data: {
      noHeader: req.query.no_header
    }
  })
})

module.exports = router