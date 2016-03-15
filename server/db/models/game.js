'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var _ = require('lodash');
var Schema = mongoose.Schema

var schema = new mongoose.Schema({
    playerCount: {
        type: Number,
        required: true
    },
    players: [{ type : Schema.Types.ObjectId,
        ref: 'User' }
        ],
    status: {
        type: String,
        default: "open",
        required: true
    },
    created: {
        type: Date,
        default: Date.now(),
        required: true
    },
    deck: {
        type : Schema.Types.ObjectId,
        ref: 'Deck'
    },
});



mongoose.model('Game', schema);
module.exports = schema;
