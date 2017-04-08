"use strict";

var Option = require('../models/option');

exports.getSources = function(req, res) {
  GLOBAL.logger.debug('-getSources---------------');

  var query = Option.find({'type':'source'});
  query.exec(function(err, sources) {
    if (err) {
      return res.status(400).send(err.err);
    }
    res.json({ sources: sources });
  });
};

exports.getStatuses = function(req, res) {
  GLOBAL.logger.debug('-getStatuses---------------');

  var query = Option.find({'type':'status'});
  query.exec(function(err, statuses) {
    if (err) {
      return res.status(400).send(err.err);
    }
    res.json({ statuses: statuses });
  });
};

exports.getRoles = function(req, res) {
  GLOBAL.logger.debug('-getRoles---------------');

  var query = Option.find({'type':'role'});
  query.exec(function(err, roles) {
    if (err) {
      return res.status(400).send(err.err);
    }
    res.json({ roles: roles });
  });
};

exports.getEvents = function(req, res) {
  GLOBAL.logger.debug('-getEvents---------------');

  var query = Option.find({'type':'event'});
  query.exec(function(err, events) {
    if (err) {
      return res.status(400).send(err.err);
    }
    res.json({ events: events });
  });
};
