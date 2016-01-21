var router = require('express').Router();
var mongoose = require('mongoose');
var Promise = require('bluebird');

var User = mongoose.model('User');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.get('/', function(req, res, next) {
    User.find().exec()
        .then(function(users) {
            // console.log("FOUND USERS", users)
            res.json(users);
        })
        .then(null, next);
});

module.exports = router;