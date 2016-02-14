'use strict'
var config = require('../config')
var TwitterStrategy = require('passport-twitter').Strategy

module.exports = new TwitterStrategy({
    consumerKey: config.TW_CONSUMER_KEY,
    consumerSecret: config.TW_CONSUMER_SECRET,
    callbackURL: config.TW_CALLBACK_URL
  },
  function(token, tokenSecret, params, profile, done) {
    process.nextTick(function () {
      // need to add twitter_id on top column
      // e.g. https://www.parse.com/questions/retrieve-facbook-id-of-user-from-authdata-field-in-ruby-on-rails
      var user = {
        "name": profile.username,
        "picture_url": profile.photos && profile.photos[0] && profile.photos[0].value,
        "contact_email": "",
        "twitter_id": profile.id,
        "authData": {
          "twitter": {
            "id": profile.id,
            "screen_name": profile.username,
            "consumer_key": config.TW_CONSUMER_KEY,
            "consumer_secret": config.TW_CONSUMER_SECRET,
            "auth_token": token,
            "auth_token_secret": tokenSecret
          }
        },
        // 1 year
        "cookie_expires": 365 * 24 * 60 * 60 * 1000
      }
      return done(null, user)
    })
  }
)