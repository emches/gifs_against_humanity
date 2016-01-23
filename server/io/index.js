'use strict';
var socketio = require('socket.io');
var io = null;

module.exports = function (server) {

    if (io) return io;

    io = socketio(server);

    io.on('connection', function (socket) {
        console.log("NEW USER", socket.id);

    socket.on('newPlayer', function(allPlayers, userCount){
      console.log("adding player!!!");
      io.emit('newPlayerFromServer', allPlayers, userCount )
    });

    socket.on('joinRoom', function(deckId){
        io.emit('gameStart', deckId);
    });

    socket.on('newQuestion', function(questionDeck){
        console.log("new question at back end", questionDeck);
        io.emit('changeQuestion', questionDeck);
    });

    socket.on('chooseGif', function(card){
        console.log("pickedGif", card);
        io.emit('updateChosenGifs', card);
    });

   socket.on('revealPicks', function(){
        console.log("got picks");
        io.emit('revealPicks');
    });

    socket.on('updateGifDeck', function(deck){
        io.emit('updateGifDeck')
    });

    socket.on('readyForNextRound', function(){
        io.emit('readyForNextRound');
    })

    socket.on('cleanupPhase', function(){
        io.emit('cleanupPhase');
    });

    socket.on('revealReady', function(){
        io.emit('revealReady');
    });

    });

    return io;

};
