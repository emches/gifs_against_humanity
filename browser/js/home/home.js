app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/play',
        templateUrl: 'js/home/home.html',
        controller: 'QuestionController',
          params: {
             allPlayers: null,
             me: null
           },
        resolve: {
            allqCards: function(QuestionFactory) {
                return QuestionFactory.fetchAll();
            }

        }
    });
});

app.controller('QuestionController', function($scope, $window, Socket, UserFactory, GifFactory, QuestionFactory, allqCards, $state) {

    Socket.on('connect', function(){
        console.log("I HAVE CONNECTED")
    })

     //  $scope.shuffle = function($event){
     //    console.log("trying to shuffle")
     //        var i = 0;
     //        console.log("this", this)
     //        console.log("event", $event.currentTarget)
     //    $event.currentTarget
     //    .animate({left: 15+'%', marginTop: 2+'em'}, 500 , 'easeOutBack',function(){
     //             i--;
     //             console.log("made it here")
     //            $event.currentTarget.css('z-index', i)
     //    })
     //     .animate({left: 38+'%', marginTop: 0+'em'}, 500, 'easeOutBack');

     // };
       console.log("state params", $state.params)

       $scope.allPlayers = _.shuffle($state.params.allPlayers)
       $scope.qCards = _.shuffle(allqCards)
       $scope.qIndex = 0

       $scope.currentQ = $scope.qCards[$scope.qIndex]
       console.log("current Question", $scope.currentQ)

       $scope.newQuestion = function(){
        console.log("HERE", $scope.qIndex)
          $scope.qIndex = $scope.qIndex < $scope.qCards.length-1 ?  $scope.qIndex+1 : 0;
        console.log("HERE2", $scope.qIndex)
        $scope.currentQ = $scope.qCards[$scope.qIndex]
       }

       $scope.allPlayers.forEach(function(user){
        user.currentStatus = "PLAYER"
       })

       $scope.dealerIndex = 0
       $scope.allPlayers[$scope.dealerIndex].currentStatus = "DEALER"
       var currentUserIndex = Math.floor(Math.random() * $scope.allPlayers.length)
       $scope.currentUser = $scope.allPlayers[currentUserIndex]

        $scope.newDealer = function(){
            $scope.allPlayers[$scope.dealerIndex].currentStatus = "PLAYER"
            $scope.dealerIndex = $scope.dealerIndex < $scope.allPlayers.length-1 ?  $scope.dealerIndex+1 : 0;
            $scope.allPlayers[$scope.dealerIndex ].currentStatus = "DEALER"
        }

        $scope.testCards = [1,2,3,4,5,6,7,8]


// START OF GAME CONTROLLER

   // $scope.primaryPlayer = $scope.allPlayers.[$scope.primaryPlayerIndex]
    // $scope.seats = [$scope.primaryPlayer];

    //construct Gif deck
    $scope.gifDeck = [];
    GifFactory.constructApiDeck()
        .then(deck => $scope.gifDeck = deck);
    $scope.dealToPlayer = function (n, cards) {
        var theHand = $scope.allPlayers[n].hand;
        while (cards >0){
            theHand.push($scope.gifDeck.shift());
            cards--
        }

    };

    console.log("allPlayers", $scope.allPlayers)
    console.log("primaryPlayerIndex", $scope.allPlayers.indexOf($state.params.me))

    //get index of primary player
    for(var i = 0; i < $scope.allPlayers.length; i++){
        if($scope.allPlayers[i]._id === $state.params.me._id){
            $scope.primaryPlayerIndex = i;
            break;
        }
    };

    $scope.primaryPlayer = $scope.allPlayers[$scope.primaryPlayerIndex]
    //construct Question Deck
    $scope.questionDeck = [];
    QuestionFactory.constructQuestionDeck()
        .then(deck => $scope.questionDeck = deck);


    //the "Table"
    $scope.currentQuestion = null;
    $scope.submittedGifs = [];




});
