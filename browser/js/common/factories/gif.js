app.factory('GifFactory', function ($http) {
    return {
        constructApiDeck: function() {
          return $http.get('http://api.giphy.com/v1/gifs/search?q=reaction&api_key=dc6zaTOxFJmzC&limit=400&offset=0&rating=r')
            .then(res => {
                var theDeck = []
                var deckData = res.data.data;
                deckData = _.shuffle(deckData);
                deckData.forEach(gifObject => theDeck.push({ imageUrl: gifObject.images.downsized.url })
                );
                return theDeck;
            })
        },
        constructSeedDeck: function () {
            return $http.get('/api/gifs')
                .then(function (cards) {
                    console.log(cards);
                    return cards.data;
                });
        }
    }
});

