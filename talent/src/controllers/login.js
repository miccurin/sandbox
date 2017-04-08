var crypto = require('crypto');
var User = require('../models/user');
var Token = require('../models/token');

module.exports = function(app, passport) {

  app.get('/', function(req, res) {
    GLOBAL.logger.debug('=== in / (get) ===');
    res.render('login', {});
  });


  app.post('/', function(req, res, next) {
    GLOBAL.logger.debug('=== in / (post) ===');

    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        GLOBAL.logger.debug('=== No user: ' + user);
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
            apiUri: GLOBAL.config.get('access:host') + ':' + GLOBAL.config.get('access:port'),
            token: tokenValue
          }});
        });
      });
    }) (req, res, next);
  });

  app.get('/logout', function(req, res) {
    GLOBAL.logger.debug('=== in /logout ===');

    if (req.headers && req.headers[GLOBAL.config.get('security:header')]) {
      var parts = req.headers[GLOBAL.config.get('security:header')].split(' ');
      if (parts.length == 2) {
        var scheme = parts[0]
        , credentials = parts[1];

        var pattern = new RegExp(GLOBAL.config.get('security:tokenTag'), 'i');
        if (pattern.test(scheme)) {
          tokenValue = credentials;

          Token.remove({ value: tokenValue }, function (err) {
            if (err) GLOBAL.logger.warn('failed to remove existing token');
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
  GLOBAL.logger.debug('=== in generateTokens ===');

  var userToken;
  var tokenValue;

  Token.remove(modelData, function (err) {
    if (err) GLOBAL.logger.error('failed to remove existing token');
  });

  tokenValue = crypto.randomBytes(32).toString('base64');
  modelData.value = tokenValue;
  userToken = new Token(modelData);

  userToken.save(function (err) {
    if (err) { return done(err); }
    done(null, tokenValue, { 'expires_in': GLOBAL.config.get('security:tokenLife') });
  });
};
