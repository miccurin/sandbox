"use strict";

var Location = require('../models/location');
// var Curve = require('../models/curve');

exports.getLocations = function(req, res) {

  GLOBAL.logger.debug('-getLocations---------------');

  var lat;
  if (typeof req.query.lat === "undefined") {
    return res.status(404).send('Lat is not provided');
  } else {
    lat = Number(req.query.lat);
    if (typeof lat !== "number") {
      return res.status(404).send('Lat is not a number = ' + lat + ', type = ' + (typeof lat));
    }
  }
  GLOBAL.logger.debug('lat='+lat);

  var long;
  if (typeof req.query.long === "undefined") {
    return res.status(404).send('Long is not provided');
  } else {
    long = Number(req.query.long);
    if (typeof long !== "number") {
      return res.status(404).send('Long is not a number = ' + long + ', type = ' + (typeof long));
    }
  }
  GLOBAL.logger.debug('long='+long);

  var distance;
  if (typeof req.query.distance === "undefined") {
    return res.status(404).send('distance is not provided');
  } else {
    distance = Number(req.query.distance);
    if (typeof distance !== "number") {
      return res.status(404).send('distance is not a number = ' + distance + ', type = ' + (typeof distance));
    }
  }
  GLOBAL.logger.debug('distance='+distance);

  var offset = 0.00001; // approximately 1 meter
  var lat1 = lat - offset * distance;
  var lat2 = lat + offset * distance;
  var long1 = long - offset * distance;
  var long2 = long + offset * distance;

  var query = Location.find({ $and: [{ lat: { $gt: lat1 } }, { lat: { $lt: lat2 } }, { long: { $gt: long1 } }, { long: { $lt: long2 } }] });
  // var query = Location.find({});
  query.exec(function(err, locations) {
    if (err) {
      return res.status(404).send(err);
    }

    var cquery = Location.find({ $and: [{ lat: { $gt: lat1 } }, { lat: { $lt: lat2 } }, { long: { $gt: long1 } }, { long: { $lt: long2 } }] });
    // var cquery = Location.find({});
    cquery.count(function(err, count) {
      if (err) {
        return res.status(404).send(err);
      }
      res.json({ count: count, locations: locations });
    });
  });
};

// exports.postCandidate = function(req, res) {
//   GLOBAL.logger.debug('-postCandidate---------------');
//   var candidate = new Candidate(req.body);
//
//   candidate.save(function(err) {
//     if (err) {
//       GLOBAL.logger.error(err.err);
//       return res.sendStatus(400);
//     } else {
//       GLOBAL.logger.debug('Candidate successfully added - id=' + candidate._id);
//       return res.location('/api/candidates/' + candidate._id).sendStatus(201);
//     }
//   });
// };
//
// exports.getCandidate = function(req, res) {
//   GLOBAL.logger.debug('-getCandidate---------------');
//   Candidate.findOne({ _id: req.params.candidate_id }, function(err, candidate) {
//     if (err) {
//       GLOBAL.logger.error('findOne: ' + err.err);
//       return res.sendStatus(404);
//     } else {
//       if (candidate) {
//         GLOBAL.logger.debug('Candidate successfully retrieved - id=' + candidate._id);
//         return res.json(candidate);
//       } else {
//         GLOBAL.logger.info('Candidate not found - id=' + req.params.candidate_id);
//         return res.sendStatus(404);
//       }
//     }
//   });
// };
//
// exports.putCandidate = function(req, res) {
//   GLOBAL.logger.debug('-putCandidate---------------');
//   Candidate.findOne({ _id: req.params.candidate_id }, function(err, candidate) {
//     if (err) {
//       GLOBAL.logger.error('findOne: ' + err.err);
//       return res.sendStatus(404);
//     }
//
//     if (candidate) {
//       for (var prop in req.body) {
//         candidate[prop] = req.body[prop];
//       }
//       candidate.updated = new Date();
//
//       candidate.save(function(err) {
//         if (err) {
//           GLOBAL.logger.error('save: ' + err.err);
//           return res.sendStatus(404);
//         } else {
//           GLOBAL.logger.debug('Candidate successfully updated - id=' + candidate._id);
//           res.sendStatus(200);
//         }
//       });
//     } else {
//       GLOBAL.logger.info('Candidate not found - id=' + req.params.candidate_id);
//       return res.sendStatus(404);
//     }
//   });
// };
//
// exports.deleteCandidate = function(req, res) {
//   GLOBAL.logger.debug('-deleteCandidate---------------');
//   Candidate.remove({ _id: req.params.candidate_id }, function(err, candidate) {
//     if (err) {
//       GLOBAL.logger.error(err.err);
//       return res.sendStatus(404);
//     } else {
//       if (candidate) {
//         GLOBAL.logger.debug('Candidate successfully deleted - id=' + req.params.candidate_id);
//         return res.sendStatus(200);
//       } else {
//         GLOBAL.logger.info('Candidate not found - id=' + req.params.candidate_id);
//         return res.sendStatus(404);
//       }
//     }
//   });
// };
// };
