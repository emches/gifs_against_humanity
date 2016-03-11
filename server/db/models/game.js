'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var _ = require('lodash');

var schema = new mongoose.Schema({
    playerCount: {
        type: Number,
        required: true
    }
});



mongoose.model('Game', schema);
module.exports = schema;