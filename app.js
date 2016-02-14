'use strict'
var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var compress = require('compression');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config')
var responseInterceptor = require('./controllers/responseInterceptor')
// dbsetup
const mongoHelper = require('./src/common/mongoHelper')
mongoHelper.init()
// routes
var routes = require('./routes/index');
var authRoute = require('./routes/auth');
// passport
// var passport = require('passport');
// var passportFacebook = require('./passport/facebook');
// var passportTwitter = require('./passport/twitter');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compress());
// turn off etag
// app.set('etag', false);
// static files
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/dist', express.static(__dirname + '/public/dist'));
app.use('/img', express.static(__dirname + '/public/img'));
app.use('/sitemap.xml', express.static(__dirname + '/public/sitemap.xml'));

// need session for twitter OAuth strategy
// app.use(session({
//   resave: true,
//   saveUninitialized: false,
//   secret: 'booking_secret'
// }))

// setup passport
// app.use(passport.initialize());
// app.use(passport.session());

// setup routes
app.use('/', routes);
// app.use('/auth', authRoute);

// setup REST API
// const rest = require('./routes/api/v1/rest')
// rest.init(app)
app.use('/api/v1/booking', require('./routes/api/v1/booking'));


// passport
// passport.use(passportFacebook);
// passport.use(passportTwitter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    responseInterceptor.render(req, res, 'error', {
      loginUser: req.user,
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  responseInterceptor.render(req, res, 'error', {
    loginUser: req.user,
    message: err.message,
    error: {}
  });
});

module.exports = app;