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
    //phases = 'initialization', 'question', 'selection', 'cleanup'

    // console.log("backend deck:", deck);
    Socket.on('connect', function(){
        console.log("I HAVE CONNECTED");
    });
        $scope.phase = 'initialization';
       // INITIALIZATION
       $scope.questionDeck= deck.questions;
       $scope.gifDeck = deck.gifs;
       $scope.allPlayers = $state.params.allPlayers;
       $scope.gameDecksId = $state.params.deckId;
       $scope.newRound = false;
        $scope._changedDealer = false;
       var numReadyForNextRound = 0;
       $scope.isWinner = false;
       $scope.winningCard = null;

        //QUESTION PHASE
       //Chosen GIFs
       $scope.myPick = null;
       $scope.showPicks = false;
       $scope.pickedCards = [];
       $scope.revealReady = false;
       $scope.chosenGifs = 0;

    // initialize players
       $scope.allPlayers.forEach(function(user){
        user.currentStatus = "PLAYER"
       });
       // initialize dealer
       $scope.dealerIndex = 0;
       $scope.allPlayers[$scope.dealerIndex].currentStatus = "DEALER";
       //get index of primary player
       for(var i = 0; i < $scope.allPlayers.length; i++){
           if($scope.allPlayers[i]._id === $state.params.me._id){
               $scope.primaryPlayerIndex = i;
               console.log("primaryPlayerIndex", $scope.primaryPlayerIndex)
               break;
           }
       }
        //initialize game function
    $scope.newQuestion = function(){
        console.log("new question request from front");
        deck.questions.shift();
        console.log("new questions", deck.questions);
        Socket.emit('newQuestion', deck.questions)
    };

       // sets primary player
       $scope.primaryPlayer = $scope.allPlayers[$scope.primaryPlayerIndex];
       //$scope.isDealer() = $scope.primaryPlayer.currentStatus === "DEALER";
        $scope.isDealer = function(){
          console.log("am i the dealer", $scope.primaryPlayerIndex === $scope.dealerIndex)
            return $scope.primaryPlayerIndex === $scope.dealerIndex;
        };

        //QUESTION PHASE

        Socket.on('changeQuestion', function(questionDeck){
            deck.questions = questionDeck;
            $scope.questionDeck= deck.questions;
            $scope.$digest()
        });


       $scope.revealPicks = function(){
         Socket.emit('revealPicks')
       };

       Socket.on('revealPicks', function(){
           $scope.pickedCards = _.shuffle($scope.pickedCards);
           $scope.showPicks = true;
           $scope.$digest()
       });

        $scope.newDealer = function(){
            console.log("new dealer recieved. old dealer", $scope.allPlayers[$scope.dealerIndex]);
            Socket.emit('newDealer');
        };
        Socket.on('newDealer', function(){
            if(!$scope._changedDealer){
                console.log("new dealer recieved. old dealer", $scope.allPlayers[$scope.dealerIndex]);
                $scope.allPlayers[$scope.dealerIndex].currentStatus = "PLAYER";
                $scope.dealerIndex = $scope.dealerIndex < $scope.allPlayers.length-1 ?  $scope.dealerIndex+1 : 0;
                $scope.allPlayers[$scope.dealerIndex].currentStatus = "DEALERR";
                $scope._changedDealer = true;
                $scope.$digest();
                console.log("new dealer", $scope.allPlayers[$scope.dealerIndex]);
            }

        });

        //GAME PLAY HELPER FUNCTIONs
        $scope.dealToPlayer = function (n, cards) {
            var theHand = $scope.allPlayers[n].hand;
            while (cards >0){
                theHand.push(deck.gifs.shift());
                cards--
            }
            Socket.emit('updateGifDeck', deck.gifs);
        };
        Socket.on('up');

      //deal to all players
       $scope.allPlayers.forEach(function(p, i){
           $scope.dealToPlayer(i, 8);
       });
       console.log("GIF DECK ", deck.gifs);

        $scope.chooseGif = function(card){
          console.log("myPick", $scope.myPick)
          console.log("dealer", $scope.isDealer())

          if (!$scope.myPick && !$scope.isDealer()){
            console.log("choosing!!!", card);
            $scope.myPick = card;
            _.remove($scope.allPlayers[$scope.primaryPlayerIndex].hand, { imageUrl: card.imageUrl });
            console.log("new gif deck", $scope.allPlayers[$scope.primaryPlayerIndex].hand  )
            card.player = $scope.primaryPlayer
            console.log("CARD", card)
            Socket.emit('chooseGif', card)
          }
        };

        Socket.on('updateChosenGifs', function(card){
          //$scope.chosenGifs++
          $scope.pickedCards.push(card);
          console.log("pickedCards", $scope.pickedCards)
          console.log("picked cards new", $scope.pickedCards);
         // console.log("chosenGifs", $scope.chosenGifs)
          if($scope.pickedCards.length === $scope.allPlayers.length - 1){
                Socket.emit('revealReady')
            }
          $scope.$digest();
        });

        $scope.selectWinner = function(card){
          if (!$scope.winningCard){
           Socket.emit('winningCard', card)
          }

        }

        Socket.on('winningCard', function(card){
          var winnerIndex = _.findIndex($scope.allPlayers, { _id: card.player._id});
          console.log("winnerIndex", winnerIndex)
          $scope.allPlayers[winnerIndex].score+=1
          if ($scope.primaryPlayerIndex===$scope.winnerIndex){ $scope.isWinner=true}
            $scope.winningCard = card;
          $scope.$digest()


        })

        Socket.on('revealReady', function(){
          $scope.revealReady = true;
          $scope.$digest()
        });

        //dealer to choose card

        //CLEANUP PHASE
        //clear selected gif cards
        //point to selected card
        //all sans dealer new card
    $scope.toQuestionPhase = function() {
        Socket.emit('toQuestionPhase');
        //wait for all players to be ready
    };
    Socket.on('toQuestionPhase', function(){
        if(!$scope.isDealer()) {
            console.log("STARt");
            GifFactory.dealGifCard($scope.gameDecksId)
                .then(newCard => {
                    console.log("Got new Card from backend")
                    $scope.primaryPlayer.hand.push(newCard);
                    Socket.emit('readyForNextRound');
                })
        }
    });
    Socket.on('readyForNextRound', function(){
        console.log("ready for next round recieved")
        numReadyForNextRound++;
        if(numReadyForNextRound === $scope.allPlayers.length - 1){
            Socket.emit('cleanupPhase')

        }
    });
    Socket.on('cleanupPhase', function(){
        console.log("CLEANUP PHASE")
        $scope.newRound = true;
        //next dealer iterated
        $scope.newDealer();
        $scope.newQuestion();
        $scope.pickedCards = [];
        $scope.myPick = null;
        $scope.showPicks = false;
        numReadyForNextRound = 0;
        $scope.$digest();
    });


        $scope.gamePhase = 0;

});
