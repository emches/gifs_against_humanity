app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'QuestionController',
        resolve: {
            allqCards: function(QuestionFactory) {
                return QuestionFactory.fetchAll();
            },
            allUsers: function(UserFactory) {
                return UserFactory.fetchAll();
            }
        }


    });
});

app.controller('QuestionController', function($scope, QuestionFactory, allqCards, allUsers) {
       console.log("qcards", allqCards);
       console.log("users", allUsers);
       $scope.users = allUsers

});

app.factory('QuestionFactory', function($http) {
    var QuestionFactory = {}
    QuestionFactory.fetchAll = function() {
        return $http.get('/api/qcards')
        .then(function(response){
            return response.data;
        })
    };


    return QuestionFactory;
})
