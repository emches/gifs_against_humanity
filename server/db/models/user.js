'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var _ = require('lodash');
var cardSchema = require('./gif.js')

var schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    imageURL:{
        type: String,
        default: "https://s-media-cache-ak0.pinimg.com/236x/ee/1b/fc/ee1bfc6d80856df0a748bda63e69d4d4.jpg"
    },
    email: {
        type: String,
        unique: true,
        required: true,
        default: "guest_user"
    },
    password: {
        type: String
    },
    salt: {
        type: String
    },
    score: {
        type: Number,
        default: 0
    },
    myturn: {
        type: Boolean,
        default: false,
        required: true
    },
    admin: {
        type: Boolean,
        default: false,
        required: true
    },
    hand: {
        type: [cardSchema],
        default: []    }
});

// method to remove sensitive information from user objects before sending them out
schema.methods.sanitize =  function () {
    return _.omit(this.toJSON(), ['password', 'salt']);
};

// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.
var generateSalt = function () {
    return crypto.randomBytes(16).toString('base64');
};

var encryptPassword = function (plainText, salt) {
    var hash = crypto.createHash('sha1');
    hash.update(plainText);
    hash.update(salt);
    return hash.digest('hex');
};

schema.pre('save', function (next) {

    if (this.isModified('password')) {
        this.salt = this.constructor.generateSalt();
        this.password = this.constructor.encryptPassword(this.password, this.salt);
    }

    next();

});

schema.statics.generateSalt = generateSalt;
schema.statics.encryptPassword = encryptPassword;

schema.method('correctPassword', function (candidatePassword) {
    return encryptPassword(candidatePassword, this.salt) === this.password;
});

mongoose.model('User', schema);