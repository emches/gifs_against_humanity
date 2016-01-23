app.factory('GifFactory', function ($http) {
    return {
        getConstructedDeck: function(id){
            return $http.get('/api/deck/'+id)
                .then(deckObj => {
                    console.log("DECKRES", deckObj);
                   return deckObj.data;
                });
        },
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
        saveConstructedDecks: function(questionDeck, gifDeck) {
            return $http.post('/api/deck/', {
                questions: questionDeck,
                gifs: gifDeck
            })
            .then(deckRes => {
                console.log("GOT baCK FROM DECK psost", deckRes);
                return deckRes.data;
            });
        },
        constructSeedDeck: function () {
            //LEGACYYYYYY
            return $http.get('/api/gifs')
                .then(function (cards) {
                    console.log(cards);
                    return cards.data;
                });
        },
        dealGifCard: function(id){
            console.log("Call to factory");
            return $http.get('/api/deck/'+id+'/gif/new-card')
                .then(cardObj => cardObj.data);
        }
    }
});

