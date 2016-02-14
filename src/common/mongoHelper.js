'use strict'
const mongoose = require('mongoose')
const config = require('../../config')
const fs = require('fs')
const path = require('path')
const join = path.join

module.exports = {

  init () {
    // connect to both crawled and parsed DB
    const connect = () => {
      mongoose.connect(this.getMongoURL(), this.getMongoOptions())
    }
    connect()

    // Bootstrap models
    fs.readdirSync(join(__dirname, '../../models')).forEach((file) => {
      if (~file.indexOf('.js') && file.indexOf('_') !== 0) {
        require(join(__dirname, '../../models', file))
      }
    })

    mongoose.connection.on('error', console.log)
    mongoose.connection.on('disconnected', connect)
  },

  getMongoURL () {
    if (config.MONGO_USER) {
      return 'mongodb://' + config.MONGO_USER + ':' + config.MONGO_PASS + '@' + config.MONGO_HOST + '/' + config.MONGO_DB
    } else {
      return 'mongodb://' + config.MONGO_HOST + '/' + config.MONGO_DB
    }
  },

  getMongoOptions () {
    const mongoOption = {}
    if (config.MONGO_REPL_NAME) {
      mongoOption.replset = { rs_name: config.MONGO_REPL_NAME }
    }
    return mongoOption
  },

  formatError (err) {
    if (!err) {
      return ''
    }
    const msgs = []
    if (err.errors) {
      var errors = err.errors
      for (var name in errors) {
        if (name && errors[name]) {
          msgs.push(errors[name].message)
        }
      }
    } else if (err.message) {
      msgs.push(err.message)
    } else {
      msgs.push(JSON.stringify(err))
    }
    return msgs.join('\n')
  }

}
