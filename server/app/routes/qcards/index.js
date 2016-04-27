'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');

module.exports = router;
var _ = require('lodash');
var Question = mongoose.model('Question');


router.get('/', function (req, res, next) {
    console.log("HERE")
    Question.find().exec()
        .then(function(questions) {
            console.log("FOUND Qs", questions)
            res.json(questions);
        })
        .then(null, next);
});

router.get('/shuffle', function(req, res, next){
        Question.find({})
            .then(function(questions){
                    // res.status(200).send(questions)

                   res.status(200).send(_.shuffle(questions))
                });
    });

module.exports = router;