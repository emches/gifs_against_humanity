/**
 * Created by nick on 1/21/16.
 */
app.factory('GifFactory', function($http){
    return {
        constructGifDeck: function(){
            return $http.get('/api/gifs')
                .then(function(cards){
                    console.log(cards);
                    return cards.data;
                });
        }
    }
});