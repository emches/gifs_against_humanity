app.factory('QuestionFactory', function($http){
    return {
        constructQuestionDeck: function(){
            return $http.get('/api/qcards/shuffle')
                .then(function(cards){
                    return cards.data;
                });
        }
    }
})