"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var curveSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  candidateId: { type: Schema.Types.ObjectId, required: true },
  datum: { type: Date, default: Date.now },
  event: { type: String, required: true },
  comment: String,
  integrity: Number,
  motivation: Number,
  fit: Number,
  curiosity: Number,
  capacity: Number,
  dexterity: Number,
  networking: Number,
  leadership: Number,
  knowledge: Number,
  experience: Number,
  added: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Curve', curveSchema);
