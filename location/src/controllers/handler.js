"use strict";

exports.notFound = function(req, res) {
  var message = 'Handler not found for ' + req.path;
  GLOBAL.logger.warn(message);
  return res.status(404).send({ message: message });
};
