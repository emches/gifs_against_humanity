app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/play',
        templateUrl: 'js/home/home.html',
        controller: 'QuestionController',
          params: {
             allPlayers: null,
             me: null,
             gifDeck: null,
             questionDeck: null
           }
    });
});

app.controller('QuestionController', function($scope, $window, Socket, UserFactory, GifFactory, QuestionFactory, $state) {

    Socket.on('connect', function(){
        console.log("I HAVE CONNECTED")
    });

       $scope.qCards=$state.params.questionDeck;
       $scope.gifDeck = $state.params.gifDeck;


       $scope.allPlayers = _.shuffle($state.params.allPlayers);

       $scope.currentQ = $scope.qCards[$scope.qIndex];

       $scope.newQuestion = function(){
          $scope.qIndex = $scope.qIndex < $scope.qCards.length-1 ?  $scope.qIndex+1 : 0;
          $scope.currentQ = $scope.qCards[$scope.qIndex]
       };

       $scope.allPlayers.forEach(function(user){
        user.currentStatus = "PLAYER"
       });

        //assign dealer
       $scope.dealerIndex = 0;
       $scope.allPlayers[$scope.dealerIndex].currentStatus = "DEALER";
       var currentUserIndex = Math.floor(Math.random() * $scope.allPlayers.length);
       $scope.currentUser = $scope.allPlayers[currentUserIndex];

        $scope.newDealer = function(){
            $scope.allPlayers[$scope.dealerIndex].currentStatus = "PLAYER";
            $scope.dealerIndex = $scope.dealerIndex < $scope.allPlayers.length-1 ?  $scope.dealerIndex+1 : 0;
            $scope.allPlayers[$scope.dealerIndex ].currentStatus = "DEALER"
        };

//GAME PLAY HELPER FUNCTIONs
    $scope.dealToPlayer = function (n, cards) {
        var theHand = $scope.allPlayers[n].hand;
        while (cards >0){
            theHand.push($scope.gifDeck.shift());
            cards--
        }

    };

// START OF GAME CONTROLLER

    //deal to all players
    $scope.allPlayers.forEach(function(p, i){
        $scope.dealToPlayer(i, 8);
    });

    //get index of primary player
    for(var i = 0; i < $scope.allPlayers.length; i++){
        if($scope.allPlayers[i]._id === $state.params.me._id){
            $scope.primaryPlayerIndex = i;
            break;
        }
    }
    $scope.primaryPlayer = $scope.allPlayers[$scope.primaryPlayerIndex];

    //game variables.
    $scope.gamePhase = 0;

    //the "Table"
    $scope.currentQuestion = null;
    $scope.submittedGifs = [];



});
