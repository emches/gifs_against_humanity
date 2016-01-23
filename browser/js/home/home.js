app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/play',
        templateUrl: 'js/home/home.html',
        controller: 'QuestionController',
          params: {
             allPlayers: null,
             me: null,
             deckId: null
           },
        resolve: {
            deck: function($stateParams, GifFactory){
                console.log("[resolve] starting..", $stateParams);
                return GifFactory.getConstructedDeck($stateParams.deckId);
            }
        }
    });
});

app.controller('QuestionController', function($scope, $window, Socket, UserFactory,
                                              GifFactory, QuestionFactory, $state, deck) {
   // console.log("backend deck:", deck);
    Socket.on('connect', function(){
        console.log("I HAVE CONNECTED");
    });
       // initializing
       $scope.questionDeck= deck.questions;
       $scope.gifDeck = deck.gifs;
       $scope.allPlayers = $state.params.allPlayers;
       // initialize players
       $scope.allPlayers.forEach(function(user){
        user.currentStatus = "PLAYER"
       });
       // initialize dealer
       $scope.dealerIndex = 0;
       $scope.allPlayers[$scope.dealerIndex].currentStatus = "DEALER";

      // console.log("questionDeck", $scope.questionDeck)



       //get index of primary player
       for(var i = 0; i < $scope.allPlayers.length; i++){
           if($scope.allPlayers[i]._id === $state.params.me._id){
               $scope.primaryPlayerIndex = i;
               break;
           }
       }
       // sets primary player
       $scope.primaryPlayer = $scope.allPlayers[$scope.primaryPlayerIndex];
       $scope.isDealer = $scope.primaryPlayer.currentStatus === "DEALER"

       //Chosen GIFs
       $scope.myPick = null;
       $scope.showPicks = false;
       $scope.pickedCards = []


       $scope.revealPicks = function(){
         console.log("emitting picks")
         Socket.emit('revealPicks')
       }

       Socket.on('revealPicks', function(){
        console.log("changing showPicks")
           $scope.showPicks = true;
           $scope.$digest()
       })

       $scope.newQuestion = function(){
          console.log("new question request from front")
          deck.questions.shift();
          console.log("new questions", deck.questions)
          Socket.emit('newQuestion', deck.questions)
       };

       Socket.on('changeQuestion', function(questionDeck){
          console.log("registered newQuestion", questionDeck)
          deck.questions = questionDeck
          $scope.questionDeck= deck.questions;
          $scope.$digest()
       });


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

      //deal to all players
       $scope.allPlayers.forEach(function(p, i){
           $scope.dealToPlayer(i, 8);
       });

        $scope.chooseGif = function(card){
          if (!$scope.myPick && !$scope.isDealer){
            console.log("choosing!!!", card)
            $scope.myPick = card;
            _.remove($scope.allPlayers[$scope.primaryPlayerIndex].hand, { imageUrl: card.imageUrl })
            console.log("new gif deck", $scope.allPlayers[$scope.primaryPlayerIndex].hand  )
            Socket.emit('chooseGif', card)
          }
        }

        Socket.on('updateChosenGifs', function(card){
          $scope.pickedCards.push(card)
          console.log("picked cards new", $scope.pickedCards)
          $scope.$digest();
        })


        $scope.gamePhase = 0;

});
