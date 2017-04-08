var express = require('express');
var https = require('https');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
var mongoose = require('mongoose');
var log = require('./bin/log')(module);
var config = require('./bin/config');
var login = require('./controllers/login');

// connect to the database
mongoose.connect(config.get('mongoose:uri'));
var db = mongoose.connection;
db.on('error', function (err) {
  log.error('connection error:', err.message);
});
db.once('open', function callback () {
  log.info('database is alive and well');
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

// enable dev logging level
app.use(logger('dev'));

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
require('./bin/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// setup routes
require('./controllers/login.js')(app, passport);

// setup keys
var options = {
  key: fs.readFileSync('./keys/key.pem'),
  cert: fs.readFileSync('./keys/key-cert.pem')
};

// app.listen(config.get('client:port'));
https.createServer(options, app).listen(config.get('client:port'));
log.info('talent client server listening on port ' + config.get('client:port'));
