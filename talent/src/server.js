"use strict";

// load configuration and store globally
GLOBAL.config = require('./config');
GLOBAL.logger = require('./logger');

var express = require('express');
var https = require('https');
// var http = require('http');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
var mongoose = require('mongoose');
var handler = require('./controllers/handler');
var candidate = require('./controllers/candidate');
var user = require('./controllers/user');
var location = require('./controllers/location');
var option = require('./controllers/option');

// connect to the database
mongoose.connect(GLOBAL.config.get('mongoose:uri'));
var db = mongoose.connection;
db.on('error', function (err) {
  GLOBAL.logger.error('connection error:', err.message);
});
db.once('open', function callback () {
  GLOBAL.logger.info('database is alive and well');
});

// this is an express application
var app = express();

// enable cross domain access
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};
app.use(allowCrossDomain);

// use jade as views engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// access to static content
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// enable sessions - needed by flash
app.use(session({
  secret: 'talent',
  token: '',
  resave: false,
  saveUninitialized: false
}));

// configure flash
app.use(flash());
app.use(function (req, res, next) {
  res.locals.flash = req.flash();
  next();
});

// initialize passport
require('./controllers/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// setup routes
require('./controllers/login')(app, passport);

// create Express router
var router = express.Router();

// testing
router.route('/api/locations')
.get(location.getLocations);

// util
router.route('/api/sources')
.get(option.getSources);
router.route('/api/statuses')
.get(option.getStatuses);
router.route('/api/roles')
.get(option.getRoles);
router.route('/api/events')
.get(option.getEvents);

// endpoint handlers for candidate
router.route('/api/candidates')
.get(handler.isAuthenticated, candidate.getCandidates)
.post(handler.isAuthenticated, candidate.postCandidate);

router.route('/api/candidates/:candidate_id')
.get(handler.isAuthenticated, candidate.getCandidate)
.put(handler.isAuthenticated, candidate.putCandidate)
.delete(handler.isAuthenticated, candidate.deleteCandidate);

router.route('/api/candidates/:candidate_id/archive')
.patch(handler.isAuthenticated, candidate.archiveCandidate);

router.route('/api/candidates/:candidate_id/curves')
.get(handler.isAuthenticated, candidate.getCandidateCurves)
.post(handler.isAuthenticated, candidate.postCandidateCurve);

router.route('/api/candidates/:candidate_id/curves/:curve_id')
.get(handler.isAuthenticated, candidate.getCandidateCurve)
.put(handler.isAuthenticated, candidate.putCandidateCurve)
.delete(handler.isAuthenticated, candidate.deleteCandidateCurve);

// endpoint handlers for user
router.route('/api/users')
.get(handler.isAuthenticated, user.getUsers)
.post(handler.isAuthenticated, user.postUser);

router.route('/api/users/:user_id')
.get(handler.isAuthenticated, user.getUser)
.put(handler.isAuthenticated, user.putUser)
.delete(handler.isAuthenticated, user.deleteUser);

router.route('*')
.get(handler.notFound)
.post(handler.notFound)
.put(handler.notFound)
.delete(handler.notFound);

// register all routes
app.use(router);

var options = {
  key: fs.readFileSync(__dirname + '/keys/key.pem'),
  cert: fs.readFileSync(__dirname + '/keys/key-cert.pem')
};

// start the server
https.createServer(options, app).listen(GLOBAL.config.get('access:port'));
// http.createServer(app).listen(GLOBAL.config.get('access:port'));
GLOBAL.logger.info('talent api server listening on port ' + GLOBAL.config.get('access:port'));
