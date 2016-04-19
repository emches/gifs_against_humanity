var router = require('express').Router();
var mongoose = require('mongoose');
var Deck = mongoose.model('Deck');
module.exports = router;

router.get('/:id', function(req, res, next){
    Deck.findOne({ _id: req.params.id })
    .then(deck => {
        res.status(200).send(deck)
    });
});

router.get('/:id/gif/new-card', function(req, res, next) {
    Deck.findOne({_id: req.params.id})
        .then(deck => deck.dealGifCard())
        .then(newCard => res.status(200).send(newCard))
        .then(null, next)
});

router.post('/', function(req, res, next){
    Deck.create({
        questions: req.body.questions,
        gifs: req.body.gifs
    })
    .then(createdDeck => res.status(200).send(createdDeck))
    .then(null, error => {
        next(error);
    });
});
