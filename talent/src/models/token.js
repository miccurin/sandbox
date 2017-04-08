"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tokenSchema = new Schema({
  value: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Token', tokenSchema);
