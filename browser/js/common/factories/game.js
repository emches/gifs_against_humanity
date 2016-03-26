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
        }
    }
});

