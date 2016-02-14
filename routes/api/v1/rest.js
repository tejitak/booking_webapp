'use strict'
const restful = require('node-restful')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
// const Booking = mongoose.model('Booking')

module.exports = {

  init(app) {
    // REST API
    app.use(methodOverride())
    
    // Booking
    // const BookingResource = restful.model('Booking', Booking)
    //   .methods(['get'])
    // // auth check before register
    // // BookingResource.before('get', requestInterceptor.isApiAuthenticated)
    // // register API
    // BookingResource.register(app, '/api/v1/booking')
  }

}
