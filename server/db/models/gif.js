'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var _ = require('lodash');

var schema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    used: {
        type: Boolean,
        default: false,
        required: true
    }
});



mongoose.model('Gif', schema);
module.exports = schema;