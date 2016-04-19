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
          var myRoom = (room._id).toString()
          socket.room = myRoom
          socket.join(myRoom)
          //io.emit('gameStart', room);
          socket.broadcast.to(myRoom).emit('newPlayerTest', room)
          io.emit('updateRooms');

      });

      socket.on('gameStart', function(room){
          var myRoom = (room._id).toString()
          console.log("joining game", room.name)
          socket.broadcast.to(myRoom).emit('gameStart', room)
      });

      socket.on('newQuestion', function(questionDeck){
          io.sockets.in(socket.room).emit('changeQuestion', questionDeck)
      });

      socket.on('chooseGif', function(card, room){
          var myRoom = (room._id).toString()
          console.log("has a room?", socket.room)
         // socket.broadcast.to(room).emit('chooseGif', card);
        io.sockets.in(socket.room).emit('chooseGif', card)
      });

      socket.on('revealPicks', function(){
        io.sockets.in(socket.room).emit('revealPicks')
      });

      socket.on('updateGifDeck', function(){
        io.sockets.in(socket.room).emit('updateGifDeck')
      });

      socket.on('cleanupPhase', function(){
        io.sockets.in(socket.room).emit('cleanupPhase')
      });

      socket.on('revealReady', function(){
        io.sockets.in(socket.room).emit('revealReady')
      });

      socket.on('doCleanupPhase', function(card){
        io.sockets.in(socket.room).emit('doCleanupPhase', card)
      });

      socket.on('newDealer', function(){
        io.sockets.in(socket.room).emit('newDealer')
      });

      socket.on('toQuestionPhase', function(){
        io.sockets.in(socket.room).emit('toQuestionPhase')
      });

      socket.on('updateOnePlayerStats', function(stats, ind){
        io.sockets.in(socket.room).emit('updateOnePlayerStats', stats, ind)
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
