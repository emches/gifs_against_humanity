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
        createRoom: function(deck, player){
            return $http.post('/api/games/', {
                deck: deck,
                player: player,
                playerCount: 3
            })
        }
    }
});

