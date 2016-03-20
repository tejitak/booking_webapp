'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PhotoSchema = new Schema({
  url: { type: String }
})

mongoose.model('Photo', PhotoSchema)

module.exports = PhotoSchema
