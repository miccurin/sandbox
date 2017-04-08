"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  group: { type: String, required: true },
  added: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
