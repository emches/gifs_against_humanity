var router = require('express').Router();
var mongoose = require('mongoose');
var Promise = require('bluebird');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.get('/:id', function(req, res, next) {
    Game.findOne( {_id: req.params.id}).exec()
        .then(function(game) {
            res.json(game);
        })
        .then(null, next);
});

router.post('/', function(req, res, next) {
    console.log("body", req.body)
    Game.create({playerCount: req.body.playerCount})
        .then(function(game){
            res.json(game);
        })
        .then(null, next);
});

module.exports = router;