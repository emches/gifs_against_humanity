var router = require('express').Router();
var mongoose = require('mongoose');
var Promise = require('bluebird');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var Game = mongoose.model('Game');

router.get('/:id', function(req, res, next) {
    Game.findOne( {_id: req.params.id}).exec()
        .then(function(game) {
            res.json(game);
        })
        .then(null, next);
});

router.post('/', function(req, res, next) {
    var player = req.body.player._id;
    console.log("player", player);
    Game.create({playerCount: req.body.playerCount, players: [player], deck: req.body.deck._id})
        .then(function(game){
            console.log("created!!", game)
            res.json(game);
        })
        .then(null, next);
});

module.exports = router;
