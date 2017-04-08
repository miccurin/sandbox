"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = new Schema({
  sponsorcode: { type: String, required: true },
  sponsorname: { type: String, required: true },
  locationcode: { type: String, required: true },
  locationname: { type: String, required: true },
  address1: { type: String, required: false },
  address2: { type: String, required: false },
  city: { type: String, required: false },
  provinceshort: { type: String, required: false },
  province: { type: String, required: false },
  postalcode: { type: String, required: false },
  lat: Number,
  long: Number,
  added: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema);
