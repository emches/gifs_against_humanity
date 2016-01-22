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

app.controller('QuestionController', function($scope, $window, UserFactory, QuestionFactory, allqCards, allUsers, $stateParams) {
       console.log("STATE PARAMS", $stateParams)
       console.log("qcards", allqCards)
       console.log("users", allUsers)
       $scope.users = _.shuffle(allUsers)
       $scope.users.forEach(function(user){
        user.currentStatus = "PLAYER"
       })

       $scope.dealerIndex = 0
       $scope.users[$scope.dealerIndex].currentStatus = "DEALER"
      var currentUserIndex = Math.floor(Math.random() * $scope.users.length)
      $scope.currentUser = $scope.users[currentUserIndex]

        $scope.newDealer = function(){
            $scope.users[$scope.dealerIndex].currentStatus = "PLAYER"
            $scope.dealerIndex = $scope.dealerIndex < $scope.users.length-1 ?  $scope.dealerIndex+1 : 0;
            $scope.users[$scope.dealerIndex ].currentStatus = "DEALER"
        }

        $scope.testCards = [1,2,3,4,5,6,7,8]

        $scope.addUser = function(){
            console.log("users",$scope.users.length )
            if ($scope.users.length >5){ return $window.alert("ROOM FULL SORRY!!!"); }
            console.log("add this", $scope.newUser)
            UserFactory.addUser($scope.newUser)
                .then(function(user){
                    console.log("got user back", user)
                    user.currentStatus = "PLAYER"
                    $scope.users.push(user)
                    console.log("new scope", $scope.users)
                    $scope.currentUser = user
                    console.log("new current", $scope.currentUser)
                })

        }


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

