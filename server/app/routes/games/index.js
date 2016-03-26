var router = require('express').Router();
var mongoose = require('mongoose');
var Promise = require('bluebird');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var Game = mongoose.model('Game');

router.get('/', function(req, res, next) {
    console.log("here")
    Game.find().exec()
        .then(function(games) {
            console.log("games", games)
            res.json(games);
        })
        .then(null, next);
});

router.get('/:id', function(req, res, next) {
    Game.findOne( {_id: req.params.id}).exec()
        .then(function(game) {
            res.json(game);
        })
        .then(null, next);
});



router.post('/', function(req, res, next) {
    var player = req.body.player._id;
   // console.log("player", player);
    Game.create({playerCount: req.body.playerCount,
                players: [player],
                deck: req.body.deck._id,
                name: req.body.name,
                password: req.body.password
            })
        .then(function(game){
            console.log("created!!", game)
            res.json(game);
        })
        .then(null, next);
});

router.put('/:room/user', function(req, res, next) {
    var user = req.body.user
    console.log("req.params", req.params)
   console.log("player", req.body.user);
    Game.findOne({_id: req.params.room})
        .then(function(game){
            console.log("game", game.players)
            game.players.push(user)
            game.save(function(err){
                  game.populate('players', function(err, game){
                    console.log("populate",game )
                    res.json(game);
                  })
            })

        })
        .then(null, next);
});

module.exports = router;
