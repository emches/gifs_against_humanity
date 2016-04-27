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
    console.log('[models/question] dealGifCard called');
    return this.save()
        .then(() => {
            console.log('[models/questions] saved, returning card: ', cardToSend);
            return cardToSend;
        });
};

mongoose.model('Question', questionSchema);
mongoose.model('Deck', deckSchema);