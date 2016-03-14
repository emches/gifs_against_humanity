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
            deck: function ($stateParams, GifFactory) {
                return GifFactory.getConstructedDeck($stateParams.deckId);
            }
        }
    });
});

app.controller('QuestionController', function ($scope, $window, Socket, UserFactory,
                                               GifFactory, QuestionFactory, $state, deck) {
    //phases = 'initialization', ['question', 'selection', 'cleanup'] <-- circular
    var roundWinMsgs = ["You rock!", "GIF Game Strong!", "Wow! You seem like someone who definitely knows how to pronounce \"Gif\" correctly", "I love you.", "And I bet that's not even your final form", "Way to go!!", "Mad 1337 skillz there br0", "I'd buy you a drink! But I'm just a function on the window object", "You must have all the friends!", "I'm more than amazed!", "It's like you were born to play this game!", "You might just be \"The One\"", "All will know your name."];
    var roundLooseMsgs = ["","","","","This means war", "Shot's fired", "This doesn't mean you're not good, it just means that someone is better than you right now", "Okay, buddy. Gloves off.", "There's still time for redemption"];
    var randomItem = function(arr){
        return arr[Math.floor(Math.random() * arr.length)];
    };
    //Use this to hide dev buttons and info -- when testing/presenting
    $scope._developer = false;
    //for player profile directive
    $scope.localId = $state.params.me._id;
    $scope.phase = 'initialization';
    // INITIALIZATION
    $scope.questionDeck = deck.questions;
    $scope.gifDeck = deck.gifs;
    $scope.allPlayers = $state.params.allPlayers; // for accessing up-to-date data
    $scope.gameDecksId = $state.params.deckId;
    $scope._changedDealer = false;
    $scope.isWinner = false;
    $scope.winningCard = null;
    $scope.stats = {
        message: "Message goes here",
        round: 1,
        goal: 5,
    };
    var numReadyForNextRound = 0;

    //QUESTION PHASE
    //Chosen GIFs
    $scope.myPick = null;
    $scope.showPicks = false;
    $scope.pickedCards = [];
    $scope.revealReady = false;
    $scope.chosenGifs = 0;

    // initialize players
    $scope.allPlayers.forEach(function (user) {
        user.currentStatus = "PLAYER"
    });
    // initialize dealer
    $scope.dealerIndex = 0;
    $scope.allPlayers[$scope.dealerIndex].currentStatus = "DEALER";
    //get index of primary player
    for (var i = 0; i < $scope.allPlayers.length; i++) {
        if ($scope.allPlayers[i]._id === $state.params.me._id) {
            $scope.primaryPlayerIndex = i;
            break;
        }
    }

    $scope.getLocalPlayer = function () {
        return $scope.allPlayers[$scope.primaryPlayerIndex];
    };
    // initialize dealer
    $scope.dealerIndex = 0;
    $scope.allPlayers[$scope.dealerIndex].currentStatus = "DEALER";
    //get index of primary player
    for (var i = 0; i < $scope.allPlayers.length; i++) {
        if ($scope.allPlayers[i]._id === $state.params.me._id) {
            $scope.primaryPlayerIndex = i;
            break;
        }
    }

    //initialize game functions
    $scope.newQuestion = function () {
        deck.questions.shift();
        Socket.emit('newQuestion', deck.questions)
    };
    $scope.newDealer = function () {
        //BEGINS TEST
        $scope.allPlayers[$scope.dealerIndex].currentStatus = "PLAYER";
        $scope.dealerIndex = $scope.dealerIndex < $scope.allPlayers.length - 1 ? $scope.dealerIndex + 1 : 0;
        $scope.allPlayers[$scope.dealerIndex].currentStatus = "DEALER";
    };
    // sets primary player
    // this will soon be depricated
    $scope.primaryPlayer = $scope.allPlayers[$scope.primaryPlayerIndex];
    //$scope.isDealer() = $scope.primaryPlayer.currentStatus === "DEALER";
    $scope.isDealer = function () {
        return $scope.primaryPlayerIndex === $scope.dealerIndex;
    };


    //deal to all players
    $scope.dealToPlayer = function (n, cards, shouldUpdate) {
        var theHand = $scope.allPlayers[n].hand;
        while (cards > 0) {
            theHand.push(deck.gifs.shift());
            cards--
        }
        Socket.emit('updateGifDeck', deck.gifs);
        //singular update of all hands (at the last loop call from cleanup phase
        if (shouldUpdate) {
            Socket.emit('updateOnePlayerStats', $scope.allPlayers, $scope.primaryPlayerIndex);
        }
    };
    Socket.on('updateOnePlayerStats', function (stats, ind) {
        $scope.allPlayers[ind] = stats[ind];
        console.log("new player info", $scope.allPlayers);
    });
    Socket.on('updateGifDeck', function (newDeck) {
        deck.gif = newDeck;
    });

    $scope.allPlayers.forEach(function (p, i) {
        $scope.dealToPlayer(i, 8);
    });
    console.log("GIF DECK ", deck.gifs);

    //QUESTION PHASE
    $scope.phase = 'question';
    Socket.on('changeQuestion', function (questionDeck) {
        deck.questions = questionDeck;
        $scope.questionDeck = deck.questions;
        $scope.$digest()
    });

    Socket.on('doCleanupPhase', function (card) {
        $scope.allPlayers.forEach(function (p, i) {
            $scope.dealToPlayer(i, (8 - p.hand.length));
        });
        var winnerIndex = _.findIndex($scope.allPlayers, {_id: card.player._id});

        if($scope.primaryPlayerIndex === winnerIndex) alert("Your card was selected!\n" + randomItem(roundWinMsgs));
        else if($scope.primaryPlayerIndex !== $scope.dealerIndex) alert("The dealer has chosen " +$scope.allPlayers[winnerIndex].name + "'s card.\n"+
                    randomItem(roundLooseMsgs));

        $scope.allPlayers[winnerIndex].score += 1;
        if ($scope.primaryPlayerIndex === $scope.winnerIndex) {
            $scope.isWinner = true
        }
        $scope.winningCard = card;

        //Continue cleanup (FROM NICK)
        $scope.newDealer();
        $scope.newQuestion();
        $scope.pickedCards = [];
        $scope.myPick = null;
        $scope.showPicks = false;
        $scope.revealReady = false;
        $scope.phase = 'question';
        $scope.$digest();
    });

    $scope.revealPicks = function () {
        Socket.emit('revealPicks')
    };

    Socket.on('revealPicks', function () {
        $scope.pickedCards = _.shuffle($scope.pickedCards);
        $scope.showPicks = true;
        $scope.$digest()
    });
    //GAME PLAY HELPER FUNCTIONs

    Socket.on('up');

    //when player chooses a card during question phase
    $scope.chooseGif = function (card) {
        $scope.endHover();

        if (!$scope.myPick && !$scope.isDealer() && $scope.phase === 'question') {
            $scope.myPick = card;
            _.remove($scope.allPlayers[$scope.primaryPlayerIndex].hand, {imageUrl: card.imageUrl});
            card.player = $scope.primaryPlayer;
            Socket.emit('chooseGif', card)
        }
    };
    var hoverDelay;
    var stillHere = true;
    $scope.endHover = function () {
        clearTimeout(hoverDelay);
        stillHere = false;
        var myEl = angular.element(document.querySelector('#preview'));
        while (myEl.length > 0) {
            myEl.remove();
            myEl = angular.element(document.querySelector('#preview'))
        }
    };
    $scope.hoverImage = function ($event, xoff, yoff) {
        stillHere = this;
        hoverDelay = setTimeout( () => {
            if(stillHere !== this) return;
            var e = $event;
            var xOffset = xoff;
            var yOffset = yoff;
            this.t = this.title;
            this.title = "";
            var c = (this.t != "") ? "<br/>" + this.t : "";
            $("body").append("<p id='preview'><img src='" + this.card.imageUrl + "' alt='Image preview' /></p>");
            $("#preview")
                .css("top", (e.y - xOffset) + "px")
                .css("left", (e.x + yOffset) + "px")
                .fadeIn("fast");

        }, 300);
    };
    Socket.on('updatePlayerStats', function (stats) {
        $scope.allPlayers[$scope.primaryPlayerIndex] = stats[$scope.primaryPlayerIndex];
    });
    Socket.on('chooseGif', function (card) {
        $scope.pickedCards.push(card);
        if ($scope.pickedCards.length === $scope.allPlayers.length - 1) {
            Socket.emit('revealReady')
        }
        $scope.$digest();
    });
    Socket.on('revealReady', function () {
        $scope.revealReady = true;
        $scope.phase = 'selection';
        $scope.$digest();
        Socket.emit('updateOnePlayerStats', $scope.allPlayers, $scope.primaryPlayerIndex);
    });

    //SELECTION PHASE
    //here the dealer is able to click on a card he/she likes and it is recorded for
    //point awards in cleanup.
    $scope.dealerSelection = function (card) {
        if ($scope.phase === 'selection' && $scope.showPicks && $scope.isDealer()) {
            $scope.phase = 'cleanup';
            Socket.emit('doCleanupPhase', card);
            //$scope.toQuestionPhase();
        }
        //CLEANUP PHASE
        $scope.toQuestionPhase = function () {
            Socket.emit('toQuestionPhase');
            //wait for all players to be ready
        };
        Socket.on('toQuestionPhase', function () {
            //---DEPRICATED--- this Socket should be removed in the future.
            if ($scope.isDealer()) {
                $scope.allPlayers.forEach((player, i, a) => {
                    if ($scope.dealerIndex !== i) $scope.dealToPlayer(i, 1, (i === a.length - 1));
                });
                Socket.emit('readyForNextRound');
            }
        });
    };
    Socket.on('newDealer', function () {
        //change scope.phase to selection instaed of _changeDealer
        if (!$scope.phase === 'cleanup') {
            console.log("new dealer recieved. old dealer", $scope.allPlayers[$scope.dealerIndex]);
            $scope.allPlayers[$scope.dealerIndex].currentStatus = "PLAYER";
            $scope.dealerIndex = $scope.dealerIndex < $scope.allPlayers.length - 1 ? $scope.dealerIndex + 1 : 0;
            $scope.allPlayers[$scope.dealerIndex].currentStatus = "DEALER";
            $scope._changedDealer = true;
            $scope.$digest();
            console.log("new dealer", $scope.allPlayers[$scope.dealerIndex]);
            $scope.phase = 'question'
        }

    });
});
