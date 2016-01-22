app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/play',
        templateUrl: 'js/home/home.html',
        controller: 'QuestionController',
          params: {
             allPlayers: null
           },
        resolve: {
            allqCards: function(QuestionFactory) {
                return QuestionFactory.fetchAll();
            }

        }


    });
});

app.controller('QuestionController', function($scope, $window, UserFactory, GifFactory, QuestionFactory, allqCards, $state) {
      $scope.shuffle = function($event){
        console.log("trying to shuffle")
            var i = 0;
            console.log("this", this)
            console.log("event", $event.currentTarget)
        $event.currentTarget
        .animate({left: 15+'%', marginTop: 2+'em'}, 500 , 'easeOutBack',function(){
                 i--;
                 console.log("made it here")
                $event.currentTarget.css('z-index', i)
        })
         .animate({left: 38+'%', marginTop: 0+'em'}, 500, 'easeOutBack');

     };

       $scope.users = _.shuffle($state.params.allPlayers)
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


// START OF GAME CONTROLLER
    $scope.primaryPlayer = {
        name: "Nick2", //TODO remove hard code.
        hand: []
    };
    $scope.seats = [$scope.primaryPlayer];

    //construct Gif deck
    $scope.gifDeck = [];
    GifFactory.constructGifDeck()
        .then(deck => $scope.gifDeck = deck);
    $scope.dealToSeat = function (n) {
        var theHand = $scope.seats[n].hand;
        theHand.push($scope.gifDeck.shift());
    };

    //construct Question Deck
    $scope.questionDeck = [];
    QuestionFactory.constructQuestionDeck()
        .then(deck => $scope.questionDeck = deck);


    //the "Table"
    $scope.currentQuestion = null;
    $scope.submittedGifs = [];




});
