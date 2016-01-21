/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('./server/db');
var User = Promise.promisifyAll(mongoose.model('User'));
var Question = Promise.promisifyAll(mongoose.model('Question'));
var Gif = Promise.promisifyAll(mongoose.model('Gif'));

var qCardData =require('./server/seeds/questions.js');
var userData =require('./server/seeds/users.js');
var gifData = require('./server/seeds/gifs.js');

console.log("QCARD", qCardData);

function seedUser (userData) {
  console.log("seeding users");
   var promises = [];
   userData.forEach(function(user){
     promises.push(User.create(user))
   });
   return Promise.all(promises)
}

function seedQCards (qCardData) {
  console.log("seeding cards");
   var promises = [];
   qCardData.forEach(function(card){
     promises.push(Question.create(card))
   });
   return Promise.all(promises)
}

function seedGifs (gifCardData) {
    console.log("seeding gif-cards");
    var promises = [];
    gifCardData.forEach(function(card){
        promises.push(Gif.create(card))
    });
    return Promise.all(promises)
}

connectToDb.then(function () {
return Promise.all([Question.remove({}),User.remove({})])
    })
    .then(function () {
        return seedUser(userData);
    })
    .then(function () {
        return seedQCards(qCardData);
    })
    .then(function () {
        return seedGifs(gifData);
    })
    .then(function () {
        console.log(chalk.green('Seed successful!'));
        process.kill(0);
    }).catch(function (err) {
        console.error(err);
        process.kill(1);
    });
