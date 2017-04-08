"use strict";

var User = require('../models/user');

exports.getUsers = function(req, res) {
  GLOBAL.logger.debug('-getUsers---------------');
  var offset = req.query.offset;
  var limit = req.query.limit;
  var name = req.query.name;

  var query = User.find({});
  if (!isNaN(limit)) query.limit(limit);
  if (!isNaN(offset)) query.skip(offset);

  if (typeof name === 'string') {
    var regex = new RegExp(name, 'i');
    query.find({ name: regex });
  }
  query.exec(function(err, users) {
    if (err) {
      return res.status(400).send(err.err);
    }

    var cquery = User.find({});
    if (typeof name === 'string') {
      var regex = new RegExp(name, 'i');
      cquery.find({ name: regex });
    }
    cquery.count(function(err, count) {
      if (err) {
        return res.status(400).send(err.err);
      }
      res.json({ count: count, users: users });
    });
  });
};

exports.postUser = function(req, res) {
  GLOBAL.logger.debug('-postUser---------------');
  var user = new User(req.body);

  user.save(function(err) {
    if (err) {
      GLOBAL.logger.error(err.err);
      return res.sendStatus(400);
    } else {
      GLOBAL.logger.debug('User successfully added - id=' + user._id);
      return res.location('/api/users/' + user._id).sendStatus(201);
    }
  });
};

exports.getUser = function(req, res) {
  GLOBAL.logger.debug('-getUser---------------');
  User.findOne({ _id: req.params.user_id }, function(err, user) {
    if (err) {
      GLOBAL.logger.error('findOne: ' + err.err);
      return res.sendStatus(404);
    } else {
      if (user) {
        GLOBAL.logger.debug('User successfully retrieved - id=' + user._id);
        return res.json(user);
      } else {
        GLOBAL.logger.info('User not found - id=' + req.params.user_id);
        return res.sendStatus(404);
      }
    }
  });
};

exports.putUser = function(req, res) {
  GLOBAL.logger.debug('-putUser---------------');
  GLOBAL.logger.debug('-' + req.params.user_id + '------');
  User.findOne({ _id: req.params.user_id }, function(err, user) {
    if (err) {
      GLOBAL.logger.error('findOne: ' + err.err);
      return res.sendStatus(404);
    }

    if (user) {
      for (var prop in req.body) {
        user[prop] = req.body[prop];
      }
      user.updated = new Date();

      user.save(function(err) {
        if (err) {
          GLOBAL.logger.error('save: ' + err.err);
          return res.sendStatus(404);
        } else {
          GLOBAL.logger.debug('User successfully updated - id=' + user._id);
          res.sendStatus(200);
        }
      });
    } else {
      GLOBAL.logger.info('User not found - id=' + req.params.user_id);
      return res.sendStatus(404);
    }
  });
};

exports.deleteUser = function(req, res) {
  GLOBAL.logger.debug('-deleteUser---------------');
  User.remove({ _id: req.params.user_id }, function(err, user) {
    if (err) {
      GLOBAL.logger.error(err.err);
      return res.sendStatus(404);
    } else {
      if (user) {
        GLOBAL.logger.debug('User successfully deleted - id=' + req.params.user_id);
        return res.sendStatus(200);
      } else {
        GLOBAL.logger.info('User not found - id=' + req.params.user_id);
        return res.sendStatus(404);
      }
    }
  });
};
