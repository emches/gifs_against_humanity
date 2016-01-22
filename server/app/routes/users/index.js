var router = require('express').Router();
var mongoose = require('mongoose');
var Promise = require('bluebird');

var User = mongoose.model('User');
var Avatar = mongoose.model('Avatar');


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

router.post('/', function(req, res, next) {
    console.log("body", req.body)
    Avatar.findOne({'used': false}).exec()
        .then(function(avatar) {
            console.log("FOUND Avatars", avatar)
            avatar.used = true;
            avatar.save();

            var newUser = { name: req.body.username,
             imageURL: avatar.avatarUrl,
             status:  avatar.status,
             "password": "secretpassword",
             "salt": "testuser",
             "admin": false,
             "myturn": false,
             "hand": []
            }
            console.log("created this", newUser)
            User.create(newUser)
                .then(function(user){
            console.log("crasdfs", user)
                    res.json(user);
                })
                .then(null, next);
        })
        .then(null, next);
});

module.exports = router;