"use strict";

var Token = require('../models/token');

exports.notFound = function(req, res) {
  var message = 'Handler not found for ' + req.path;
  GLOBAL.logger.warn(message);
  return res.status(404).send({ message: message });
};

exports.isAuthenticated = function(req, res, next) {
  GLOBAL.logger.info('=== in isAuthenticated ===');
  var message = '';
  if (req.headers && req.headers[GLOBAL.config.get('security:header')]) {
    var parts = req.headers[GLOBAL.config.get('security:header')].split(' ');
    if (parts.length == 2) {
      var scheme = parts[0], credentials = parts[1];

      var pattern = new RegExp(GLOBAL.config.get('security:tokenTag'), 'i');
      if (pattern.test(scheme)) {
        var tokenValue = credentials;

        Token.findOne({ value: tokenValue }, function(err, userToken) {
          if (userToken) {
            var tokenAge = Math.round((Date.now() - userToken.created) / 1000);
            if (tokenAge > GLOBAL.config.get('security:tokenLife')) {
              message = 'Token expired';
              GLOBAL.logger.warn(message);
              return res.status(401).send({ message: message });
            } else {
              // message = "User (" + userToken.userId + ") successfully authenticated";
              // GLOBAL.logger.info(message);
              return next();
            }
          } else {
            message = 'Couldn\'t find the token';
            GLOBAL.logger.warn(message);
            return res.status(401).send({ message: message });
          }
        });
      } else {
        message = 'No token attribute';
        GLOBAL.logger.warn(message);
        return res.status(401).send({ message: message });
      }
    } else {
      message = 'Invalid authorization header';
      GLOBAL.logger.warn(message);
      return res.status(401).send({ message: message });
    }
  } else {
    message = 'No authorization header';
    GLOBAL.logger.warn(message);
    return res.status(401).send({ message: message });
  }
};
