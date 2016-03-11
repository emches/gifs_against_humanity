app.factory('GameFactory', function ($http) {
    return {
        initializeGame: function(playerCount) {
            return $http.post('/api/deck/', {
                questions: questionDeck,
                gifs: gifDeck
            })
            .then(deckRes => {
                console.log("GOT baCK FROM DECK psost", deckRes);
                return deckRes.data;
            });
        }
    }
});

