"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var candidateSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  source: { type: String, required: true, default: 'unknown' },
  status: { type: String, required: true, default: 'unknown' },
  archived: { type: Boolean, default: false },
  added: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Candidate', candidateSchema);
