'use strict';
var router = require('express').Router();
var Gif = require('mongoose').model('Gif');
var _ = require('lodash');
module.exports = router;

router.get('/', function (req, res, next) {
    Gif.find({})
        .then(gifs => res.status(200).send(_.shuffle(gifs)))
        .then(null, next);
});