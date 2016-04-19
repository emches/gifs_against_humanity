'use strict';
var socketio = require('socket.io');
var io = null;

module.exports = function (server) {
    if (io) return io;
    io = socketio(server);

    io.on('connection', function (socket) {
        console.log("NEW USER", socket.id);

      socket.on('newPlayer', function(allPlayers, userCount){
        io.emit('newPlayer', allPlayers, userCount )
      });

      socket.on('joinRoom', function(room){
          console.log("starting", room.name)
          socket.room = room.name
          socket.join(room.name)
          //io.emit('gameStart', room);
          socket.broadcast.to(room.name).emit('newPlayerTest', room)
          io.emit('updateRooms');

      });


      socket.on('gameStart', function(room){
          console.log("joining game", room.name)
          socket.broadcast.to(room.name).emit('gameStart', room)
      });

      socket.on('newQuestion', function(questionDeck){
          io.emit('changeQuestion', questionDeck);
      });

      socket.on('chooseGif', function(card, room){
        //socket.join(room)
         // socket.broadcast.to(room).emit('chooseGif', card);
        io.sockets.in(room).emit('chooseGif', card)
      });

      socket.on('revealPicks', function(){
          io.emit('revealPicks');
      });

      socket.on('updateGifDeck', function(deck){
          io.emit('updateGifDeck')
      });


      socket.on('cleanupPhase', function(){
          io.emit('cleanupPhase');
      });

      socket.on('revealReady', function(){
          io.emit('revealReady');
      });

      socket.on('doCleanupPhase', function(card){
          io.emit('doCleanupPhase', card);
      });

      socket.on('newDealer', function(){
          io.emit('newDealer');
      });

      socket.on('toQuestionPhase', function(){
         io.emit('toQuestionPhase');
      });

      socket.on('updateOnePlayerStats', function(stats, ind){
          io.emit('updateOnePlayerStats', stats, ind);
      });

      socket.on('winningCard', function(card){
         //Depricted: This is merged with `doCleanupPhase`
         io.emit('winningCard', card);
      });

      socket.on('newConnection', function(){
          io.emit('newConnection');
      });

      socket.on('readyForUsername', function(){
          io.emit('readyForUsername');
      })
  });

    return io;
};
