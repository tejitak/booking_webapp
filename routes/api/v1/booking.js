'use strict'
const __ = require('underscore')
const express = require('express')
const mongoose = require('mongoose')
const Booking = mongoose.model('Booking')
const util = require('../../../src/common/util')
const router = express.Router()

/* GET Booking list from DB */
router.get('/', (req, res, next) => {

  const order = req.query.order // $near
  const limit = req.query.limit // 20
  const skip = req.query.skip // 40
  // near[latitude]:35.6560676
  // near[longitude]:139.7040436
  const near = req.query.near
  const box = req.query.box
  var query = {}
  if (box && box.length > 1) {
    query.location = {
      '$geoWithin': {
        '$box': [
          [box[0]['longitude'], box[0]['latitude']],
          [box[1]['longitude'], box[1]['latitude']]
        ]
      }
    }
  } else if (near) {
    query.location = {
      '$nearSphere': [near['longitude'], near['latitude']],
      '$maxDistance': 5
    }
  }
  Booking.find(query)
    .limit(limit)
    .skip(skip)
    // .sort({name: 'asc'})
    .exec((err, items) => {
      if (err) {
        res.status(400)
        return res.send(err)
      }
      // add distance to photos
      util.addDistanceProps(items, req.query.currentGeo)
      var result = {
        hasNext: items.length === limit,
        photos: items
      }
      res.send(result)
    })
})

/* GET Booking Detail from DB */
router.get('/:id', (req, res, next) => {
  // Booking.findOne({_id: new mongoose.Types.ObjectId(req.params.id)})
  Booking.findOne({'_id': req.params.id})
    .exec((err, item) => {
      if (err || !item) {
        return res.send(err)
      }
      // add distance to photos
      util.addDistanceProps([item], req.query.currentGeo)
      res.send(item)
    })
})

module.exports = router
