"use strict";

var nconf = require('nconf');

nconf.env().argv();
nconf.file(__dirname + '/config.json');

module.exports = nconf;
