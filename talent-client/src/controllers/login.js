var crypto = require('crypto');
var config = require('../bin/config');
var log = require('../bin/log')(module);
var User = require('../models/user');
var Token = require('../models/token');

module.exports = function(app, passport) {

  app.get('/', function(req, res) {
    console.log('=== IN SLASH GET ===');
    res.render('login', {});
  });


  app.post('/', function(req, res, next) {
    console.log('=== IN SLASH POST ===');

    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        console.log('=== No user: ' + user);
        req.flash('error', 'Incorrect credentials !!!');
        return res.redirect('/');
      }

      var modelData = { userId: user._id };
      generateTokens(modelData, function(err, tokenValue, info) {
        if (err) { return next(err); }

        //TODO (remove this later) save user and token in the session
        req.session.user = user.name;
        req.session.token = tokenValue;

        // login user with passport (not sure if this is really needed)
        req.logIn(user, { session: false }, function(err) {
          if (err) { return next(err); }
          res.render('index', { info: {
            userName: user.name,
            userId: user._id,
            apiUri: config.get('api:host') + ':' + config.get('api:port'),
            token: tokenValue
          }});
        });
      });
    }) (req, res, next);
  });

  app.get('/logout', function(req, res) {
    console.log('=== IN SLASH LOGOUT GET ===');

    if (req.headers && req.headers[config.get('security:header')]) {
      var parts = req.headers[config.get('security:header')].split(' ');
      if (parts.length == 2) {
        var scheme = parts[0]
        , credentials = parts[1];

        var pattern = new RegExp(config.get('security:tokenTag'), 'i');
        if (pattern.test(scheme)) {
          tokenValue = credentials;

          Token.remove({ value: tokenValue }, function (err) {
            if (err) log.warn('failed to remove existing token');
          });
        }
      }
    }
  });
};

function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
};

// destroy any old tokens and generates a new access token
function generateTokens(modelData, done) {

  var userToken;
  var tokenValue;

  Token.remove(modelData, function (err) {
    if (err) log.error('failed to remove existing token');
  });

  tokenValue = crypto.randomBytes(32).toString('base64');
  modelData.value = tokenValue;
  userToken = new Token(modelData);

  userToken.save(function (err) {
    if (err) { return done(err); }
    done(null, tokenValue, { 'expires_in': config.get('security:tokenLife') });
  });
};
