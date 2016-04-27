'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var _ = require('lodash');

var schema = new mongoose.Schema({
    avatarUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "MEOW!! MEOW, I SAY!!"
    },
    used: {
        type: Boolean,
        required: true,
        default: false
    },

});



mongoose.model('Avatar', schema);
module.exports = schema