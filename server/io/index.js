'use strict';
var socketio = require('socket.io');
var io = null;

module.exports = function (server) {

    if (io) return io;

    io = socketio(server);

    io.on('connection', function (socket) {
        console.log("NEW USER", socket.id)

    socket.on('newPlayer', function(allPlayers, userCount){
      console.log("adding player!!!")
      io.emit('newPlayerFromServer', allPlayers, userCount )
    });

    socket.on('joinRoom', function(){
        io.emit('gameStart');
    })

    });

    return io;

};
