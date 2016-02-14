'use strict'
var express = require('express');
var passport = require('passport');
var parseCtrl = require('../controllers/parseCtrl')
var constants = require('../controllers/constants');
var router = express.Router();

var saveCb = (sessionToken, req, res) => {
  // set to cookie with expiration
  res.cookie(constants.cookieNames.session, sessionToken, { maxAge: req.user.cookie_expires});
  // opened window will be closed by javascript and refresh parent window
  res.render('common/close')
}

//Passport Router
router.get('/facebook', passport.authenticate('facebook', {scope: ['email']}));

router.get('/facebook/callback', 
  passport.authenticate('facebook', {
    session: false
  }),
  function(req, res) {
    var saveUser = () => {
      parseCtrl.saveUser('facebook_id', req.user).then((sessionToken) => {
        saveCb(sessionToken, req, res)
      })
    }
    // if session token is already stored in cookie, just update authData for the current user
    var currentSessionToken = req.cookies[constants.cookieNames.session]
    if (currentSessionToken) {
      // link authData
      parseCtrl.linkUser(currentSessionToken, req.user.authData).then((sessionToken) => {
        saveCb(sessionToken, req, res)
      }, saveUser)
    } else {
      // save user: update authData by sns id if the user exists, otherwise create a new user
      saveUser()
    }
  }
)

router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/callback', 
  passport.authenticate('twitter', {
    session: false
  }),
  function(req, res) {
    var saveUser = () => {
      parseCtrl.saveUser('twitter_id', req.user).then((sessionToken) => {
        saveCb(sessionToken, req, res)
      })
    }
    // if session token is already stored in cookie, just update authData for the current user
    var currentSessionToken = req.cookies[constants.cookieNames.session]
    if (currentSessionToken) {
      // link authData
      parseCtrl.linkUser(currentSessionToken, req.user.authData).then((sessionToken) => {
        saveCb(sessionToken, req, res)
      }, saveUser)
    } else {
      // save user: update authData by sns id if the user exists, otherwise create a new user
      saveUser()
    }
  }
)


router.get('/logout', function(req, res){
  req.logout();
  // remove cookie
  res.clearCookie(constants.cookieNames.session);
  res.redirect('/');
});

module.exports = router;