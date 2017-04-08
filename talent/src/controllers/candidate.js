"use strict";

var Candidate = require('../models/candidate');
var Curve = require('../models/curve');

exports.getCandidates = function(req, res) {
  GLOBAL.logger.debug('-getCandidates---------------');
  var offset = req.query.offset;
  var limit = req.query.limit;
  var name = req.query.name;

  var query = Candidate.find({ archived: { $ne: true } });
  if (!isNaN(limit)) query.limit(limit);
  if (!isNaN(offset)) query.skip(offset);

  if (typeof name === 'string') {
    var regex = new RegExp(name, 'i');
    query.find({ name: regex });
  }
  query.sort({ added: 'desc' });
  query.exec(function(err, candidates) {
    if (err) {
      return res.status(404).send(err);
    }

    var cquery = Candidate.find({ archived: { $ne: true } });
    if (typeof name === 'string') {
      var regex = new RegExp(name, 'i');
      cquery.find({ name: regex });
    }
    cquery.count(function(err, count) {
      if (err) {
        return res.status(404).send(err);
      }
      res.json({ count: count, candidates: candidates });
    });
  });
};

exports.postCandidate = function(req, res) {
  GLOBAL.logger.debug('-postCandidate---------------');
  var candidate = new Candidate(req.body);

  GLOBAL.logger.info('body:'+req.body.source);

  candidate.save(function(err) {
    if (err) {
      GLOBAL.logger.error(err.err);
      return res.sendStatus(400);
    } else {
      GLOBAL.logger.debug('Candidate successfully added - id=' + candidate._id);
      return res.location('/api/candidates/' + candidate._id).sendStatus(201);
    }
  });
};

exports.getCandidate = function(req, res) {
  GLOBAL.logger.debug('-getCandidate---------------');
  Candidate.findOne({ _id: req.params.candidate_id }, function(err, candidate) {
    if (err) {
      GLOBAL.logger.error('findOne: ' + err.err);
      return res.sendStatus(404);
    } else {
      if (candidate) {
        GLOBAL.logger.debug('Candidate successfully retrieved - id=' + candidate._id);
        return res.json(candidate);
      } else {
        GLOBAL.logger.info('Candidate not found - id=' + req.params.candidate_id);
        return res.sendStatus(404);
      }
    }
  });
};

exports.putCandidate = function(req, res) {
  GLOBAL.logger.debug('-putCandidate---------------');
  Candidate.findOne({ _id: req.params.candidate_id }, function(err, candidate) {
    if (err) {
      GLOBAL.logger.error('findOne: ' + err.err);
      return res.sendStatus(404);
    }

    if (candidate) {
      for (var prop in req.body) {
        candidate[prop] = req.body[prop];
      }
      candidate.updated = new Date();

      candidate.save(function(err) {
        if (err) {
          GLOBAL.logger.error('save: ' + err.err);
          return res.sendStatus(404);
        } else {
          GLOBAL.logger.debug('Candidate successfully updated - id=' + candidate._id);
          res.sendStatus(200);
        }
      });
    } else {
      GLOBAL.logger.info('Candidate not found - id=' + req.params.candidate_id);
      return res.sendStatus(404);
    }
  });
};

exports.deleteCandidate = function(req, res) {
  GLOBAL.logger.debug('-deleteCandidate---------------');
  Candidate.remove({ _id: req.params.candidate_id }, function(err, candidate) {
    if (err) {
      GLOBAL.logger.error(err.err);
      return res.sendStatus(404);
    } else {
      if (candidate) {
        GLOBAL.logger.debug('Candidate successfully deleted - id=' + req.params.candidate_id);
        return res.sendStatus(200);
      } else {
        GLOBAL.logger.info('Candidate not found - id=' + req.params.candidate_id);
        return res.sendStatus(404);
      }
    }
  });
};

exports.archiveCandidate = function(req, res) {
  GLOBAL.logger.debug('-archiveCandidate---------------');
  Candidate.findOne({ _id: req.params.candidate_id }, function(err, candidate) {
    if (err) {
      GLOBAL.logger.error('findOne: ' + err.err);
      return res.sendStatus(404);
    }

    if (candidate) {
      candidate.archived = true;
      candidate.updated = new Date();

      candidate.save(function(err) {
        if (err) {
          GLOBAL.logger.error('save: ' + err.err);
          return res.sendStatus(404);
        } else {
          GLOBAL.logger.debug('Candidate successfully updated - id=' + candidate._id);
          res.sendStatus(200);
        }
      });
    } else {
      GLOBAL.logger.info('Candidate not found - id=' + req.params.candidate_id);
      return res.sendStatus(404);
    }
  });
};

exports.getCandidateCurves = function(req, res) {
  GLOBAL.logger.debug('-getCandidateCurves---------------');
  var offset = req.query.offset;
  var limit = req.query.limit;

  // get userId
  var userId = req.query.userId;

  // get candidate id
  var candidateId = req.params.candidate_id;

  var query = Curve.find({ candidateId: candidateId });
  if (!isNaN(limit)) query.limit(limit);
  if (!isNaN(offset)) query.skip(offset);

  if (typeof userId === 'string') {
    query.find({ userId: userId });
  }

  query.exec(function(err, curves) {
    if (err) {
      return res.status(404).send(err);
    }

    var cquery = Curve.find({ candidateId: candidateId });
    if (typeof userId === 'string') {
      cquery.find({ userId: userId });
    }
    cquery.count(function(err, count) {
      if (err) {
        return res.status(404).send(err);
      }
      res.json({ count: count, curves: curves });
    });
  });
};

exports.postCandidateCurve = function(req, res) {
  GLOBAL.logger.debug('-postCandidateCurve---------------');
  var curve = new Curve(req.body);

  curve.save(function(err) {
    if (err) {
      GLOBAL.logger.error(err.err);
      return res.sendStatus(500);
    } else {
      GLOBAL.logger.debug('Curve successfully added - id=' + curve._id);
      return res.location('/api/candidates/' + curve.candidateId +
      '/curve/' + curve._id).sendStatus(201);
    }
  });
};

exports.getCandidateCurve = function(req, res) {
  GLOBAL.logger.debug('-getCandidateCurve---------------');
  Curve.findOne({ _id: req.params.curve_id }, function(err, curve) {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(curve);
  });
};

exports.putCandidateCurve = function(req, res) {
  GLOBAL.logger.debug('-putCandidateCurve---------------');
  Curve.findOne({ _id: req.params.curve_id }, function(err, curve) {
    if (err) {
      return res.status(500).send(err);
    }

    for (var prop in req.body) {
      curve[prop] = req.body[prop];
    }
    curve.updated = new Date();

    curve.save(function(err) {
      if (err) {
        return res.status(500).send(err);
      }
      res.json({ message: 'Curve (' + curve._id + ') successfully updated' });
    });
  });
};

exports.deleteCandidateCurve = function(req, res) {
  GLOBAL.logger.debug('-deleteCandidateCurve---------------');
  GLOBAL.logger.debug('-' + req.params.curve_id + '---------------');
  Curve.remove({ _id: req.params.curve_id }, function(err, curve) {
    if (err) {
      GLOBAL.logger.error(err.err);
      return res.sendStatus(500);
    } else {
      if (curve) {
        GLOBAL.logger.debug('Curve successfully deleted - id=' + req.params.curve_id);
        return res.sendStatus(200);
      } else {
        GLOBAL.logger.info('Curve not found - id=' + req.params.curve_id);
        return res.sendStatus(404);
      }
    }
  });
};
