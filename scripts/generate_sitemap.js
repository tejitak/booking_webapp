'use strict'
var sm = require('sitemap')
var path = require('path')
var fs = require('fs')

var jsonStr = fs.readFileSync(path.join(__dirname, 'data/Restaurant.json')),
  json = {}
try {
  json = JSON.parse(jsonStr)
} catch (e) {
}

var urls = [{ url: '/' , changefreq: 'weekly', priority: 1.0, lastmodrealtime: true }]
json.results.forEach((restaurant) => {
  urls.push({ url: '/detail/' + restaurant.objectId , changefreq: 'weekly', priority: 0.8, lastmodrealtime: true })
})

var sitemap = sm.createSitemap({
  hostname: 'https://hashdish.com',
  cacheTime: 600000,  //600 sec (10 min) cache purge period
  urls: urls
});

fs.writeFileSync(path.join(__dirname, '..', 'public/sitemap.xml'), sitemap.toString());