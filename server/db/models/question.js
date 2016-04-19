'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var _ = require('lodash');

var gifSchema = require('./gif');

var questionSchema = new mongoose.Schema({
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

var deckSchema = new mongoose.Schema({
    questions: Array,
    gifs: Array
});
deckSchema.methods.dealGifCard = function() {
    var cardToSend = this.gifs.shift();
    return this.save()
        .then(() => {
            return cardToSend;
        });
};

mongoose.model('Question', questionSchema);
mongoose.model('Deck', deckSchema);
