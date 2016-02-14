'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BookingSchema = new Schema({
  id: { type: String },
  location: {
    type: [Number],  // [<longitude>, <latitude>]
    index: '2d'      // create the geospatial inde
  },
  name: { type: String },
  address: { type: String },
  zip: { type: String },
  city_hotel: { type: String },
  cc1: { type: String },
  ufi: { type: String },
  class: { type: String },
  currencycode: { type: String },
  minrate: { type: String },
  maxrate: { type: String },
  preferred: { type: String },
  nr_rooms: { type: String },
  public_ranking: { type: String },
  hotel_url: { type: String },
  photo_url: { type: String },
  desc_en: { type: String },
  desc_fr: { type: String },
  desc_es: { type: String },
  desc_de: { type: String },
  desc_nl: { type: String },
  desc_it: { type: String },
  desc_pt: { type: String },
  desc_ja: { type: String },
  desc_zh: { type: String },
  desc_pl: { type: String },
  desc_ru: { type: String },
  desc_sv: { type: String },
  desc_ar: { type: String },
  desc_el: { type: String },
  desc_no: { type: String },
  city_unique: { type: String },
  city_preferred: { type: String },
  continent_id: { type: String },
  review_score: { type: String },
  review_nr: { type: String },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})

// virtual props
BookingSchema
  .virtual('distance')
  .set(function(distance) { this._distance = distance })
  .get(function() { return this._distance })

mongoose.model('Booking', BookingSchema)

module.exports = BookingSchema