"use strict";

// load configuration and store globally
GLOBAL.config = require('./config');
GLOBAL.logger = require('./logger');

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var handler = require('./controllers/handler');
var location = require('./controllers/location');

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// create Express router
var router = express.Router();

// locations
router.route('/api/locations')
.get(location.getLocations);

router.route('*')
.get(handler.notFound)
.post(handler.notFound)
.put(handler.notFound)
.delete(handler.notFound);

// register all routes
app.use(router);

// start the server
//https.createServer(options, app).listen(GLOBAL.config.get('access:port'));
http.createServer(app).listen(GLOBAL.config.get('access:port'));
GLOBAL.logger.info('location api server listening on port ' + GLOBAL.config.get('access:port'));
