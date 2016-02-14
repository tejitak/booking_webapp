'use strict'
var config = require('../config')
var FacebookStrategy = require('passport-facebook').Strategy

module.exports = new FacebookStrategy({
    clientID: config.FB_API_KEY,
    clientSecret: config.FB_API_SECRET ,
    callbackURL: config.FB_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'link', 'photos', 'emails']
  },
  function(accessToken, refreshToken, params, profile, done) {
    process.nextTick(function () {
      // the user data is stored in req.user in passport/lib/http/request.js
      var expires = params.expires - 0
      // need to add facebook_id on top column
      // e.g. https://www.parse.com/questions/retrieve-facbook-id-of-user-from-authdata-field-in-ruby-on-rails
      var user = {
        "name": profile.displayName,
        "picture_url": profile._json.picture && profile._json.picture.data.url,
        "contact_email": profile.emails && profile.emails[0].value || '',
        "facebook_id": profile.id,
        "authData": {
          "facebook": {
            "id": profile.id,
            "access_token": accessToken,
            "expiration_date": new Date(new Date().getTime() + expires * 1000).toISOString()
          }
        },
        "cookie_expires": expires
      }
      return done(null, user)
    })
  }
)