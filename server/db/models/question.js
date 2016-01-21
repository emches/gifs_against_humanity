'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var _ = require('lodash');

var schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    used: {
        type: Boolean,
        required: true,
        default: false
    }
});



mongoose.model('Question', schema);