app.factory('GameFactory', function ($http) {
    return {
        initializeGame: function(playerCount) {
            return $http.post('/api/deck/', {
                questions: questionDeck,
                gifs: gifDeck
            })
            .then(deckRes => {
                return deckRes.data;
            });
        },
        createRoom: function(deck, player, room){
            console.log("player", player)
            return $http.post('/api/games/', {
                deck: deck,
                player: player,
                playerCount: room.playerMax,
                name: room.name,
                password: room.password,

            })
        },
        getGames: function(){
            console.log("getting games")
            return $http.get('/api/games')
                .then(function(games){
                    console.log("games", games)
                    return games.data
                })
        },
        addUserToRoom: function(user, room){
            console.log("adding to room")
            return $http.put('/api/games/' + room + '/user/', {user: user})
        }
    }
});

