var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var ActiveDirectory = require('activedirectory');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        username: 'username',
        password : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ username: username }, function (err, user) {

          // if (err) return done(null, false, { message: err });
          if (err) return done(err);
          if (!user) return done(null, false, { message: 'Wrong user name.' });

          // local testing
          if (GLOBAL.config.get('security:local')) {
            GLOBAL.logger.info('===== passport (local testing) ====');

            req.user = user;
            return done(null, user);
          } else {
            GLOBAL.logger.info('===== passport (active directory) ====');

            // config active directory connection
            var url = GLOBAL.config.get('security:host');
            var ad = new ActiveDirectory({ url: url });

            // authenticate user
            var email = username + GLOBAL.config.get('security:domain');
            ad.authenticate(email, password, function(err, auth) {
              if (err) {
                return done(null, false, { message: err });
              }
              if (!auth) {
                return done(null, false, { message: 'Incorrect credentials' });
              }

              return done(null, user);
            });
          }
        });
        });
    }));
};
