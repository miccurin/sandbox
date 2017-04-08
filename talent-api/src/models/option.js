"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var optionSchema = new Schema({
  type: { type: String, required: true },
  value: { type: String, required: true }
});

module.exports = mongoose.model('Option', optionSchema);
