app.config(function ($stateProvider) {
  $stateProvider.state('home', {
    url: '/play',
    templateUrl: 'js/home/home.html',
    controller: 'QuestionController',
    params: {
      allPlayers: null,
      me: null,
      deckId: null,
      socketId: null
    },
    resolve: {
      deck: function ($stateParams, GifFactory) {
        console.log("[resolve] starting..", $stateParams);
        return GifFactory.getConstructedDeck($stateParams.deckId);
      }
    }
  });
});

app.controller('QuestionController', function ($scope, $window, Socket, UserFactory,
                                               GifFactory, QuestionFactory, $state, deck, $timeout, $uibModal,
                                               GameModal) {
  //phases = 'initialization', ['question', 'selection', 'cleanup'] <-- circular
  var roundLooseMsgs = ["", "", "", "", "This means war", "Shot's fired", "This doesn't mean you're not good, it just means that someone is better than you right now", "Okay, buddy. Gloves off.", "There's still time for redemption"];
  var roundWinMsgs = ["You rock!", "GIF Game Strong!", "Wow! You seem like someone who definitely knows how to pronounce \"Gif\" correctly", "I love you.", "And I bet that's not even your final form", "Way to go!!", "Mad 1337 skillz there br0", "I'd buy you a drink! But I'm just a function on the window object", "You must have all the friends!", "I'm more than amazed!", "It's like you were born to play this game!", "You might just be \"The One\"", "All will know your name."];
  var plusOne = ["http://i1382.photobucket.com/albums/ah279/npalenchar/gah/Level_Up_Logo_zpsbkc8w5iv.gif"];
  
  var randomItem = function (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  //Use this to hide dev buttons and info -- when testing/presenting
  $scope._developer = false;
  // console.log("backend deck:", deck);
  //for player profile directive
  $scope.localId = $state.params.me._id;
  $scope.phase = 'initialization';
  // INITIALIZATION
  $scope.questionDeck = deck.questions;
  $scope.gifDeck = deck.gifs;
  $scope.allPlayers = $state.params.allPlayers; // for accessing up-to-date data
  console.log("ALL PLAYERS", $scope.allPlayers);
  $scope.gameDecksId = $state.params.deckId;
  $scope._changedDealer = false;
  $scope.isWinner = false;
  $scope.winningCard = null;
  $scope.stats = {
    message: "Chat Goes here!",
    round: 1,
    goal: 5,
  };
  var numReadyForNextRound = 0;

  // internals
  var mySocketId = $state.params.socketId;
  var me = $state.params.me;
  var cpu = me.cpu;
  let timerTime = {
    round: 45,
    revealReady: 8,
    choose: 60,
    cpu: 8,
  };

  console.log("MEEE", me);

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
  var foundHuman;
  for ($scope.dealerIndex = 0; $scope.dealerIndex < $scope.allPlayers.length; $scope.dealerIndex++) {
    if ($scope.allPlayers[$scope.dealerIndex].cpu === false) { //check for strict false!
      console.log("ED dhuNam");
      foundHuman = true;
      break;
    }
  }
  if (!foundHuman) {
    alert("No human players!! Bai....");
    return;
  }

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

  //initialize game functions
  $scope.newQuestion = function () {
    console.log("new question request from front");
    deck.questions.shift();
    Socket.emit('newQuestion', deck.questions);

    if ($scope.primaryPlayerIndex !== $scope.dealerIndex) {

      let time = cpu ? timerTime.cpu : timerTime.round;
      $scope.timer = new Timer(time, function () {
        var random = Math.floor(Math.random() * $scope.allPlayers[$scope.primaryPlayerIndex].hand.length);
        var randomCard = $scope.allPlayers[$scope.primaryPlayerIndex].hand[random];
        console.log("random card", randomCard);
        $scope.chooseGif(randomCard);
      }, function () {
        $scope.$digest();
      });
    }
  };
  $scope.newDealer = function () {
    console.log("new dealer recieved. old dealer", $scope.allPlayers[$scope.dealerIndex]);
    //BEGINS TEST
    $scope.allPlayers[$scope.dealerIndex].currentStatus = "PLAYER";
    $scope.dealerIndex = $scope.dealerIndex < $scope.allPlayers.length - 1 ? $scope.dealerIndex + 1 : 0;
    $scope.allPlayers[$scope.dealerIndex].currentStatus = "DEALER";
    console.log("cpu??", cpu, "\nstatus ", me.currentStatus);
    if (cpu && me.currentStatus === "DEALER") $scope.newDealer();
  };
  // sets primary player
  // this will soon be depricated
  $scope.primaryPlayer = $scope.allPlayers[$scope.primaryPlayerIndex];
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
    // console.log("a new hand", $scope.getLocalPlayer().hand);
    //singular update of all hands (at the last loop call from cleanup phase
    if (shouldUpdate) {
      console.log("UPDATING PLAYER STATS: ", $scope.allPlayers);
      Socket.emit('updateOnePlayerStats', $scope.allPlayers, $scope.primaryPlayerIndex);
    }
  };
  Socket.on('updateOnePlayerStats', function (stats, ind) {
    console.log("updateOnePlayerStats socket: updating...", $scope.allPlayers[ind], stats[ind]);
    $scope.allPlayers[ind] = stats[ind];
    console.log("new player info", $scope.allPlayers);
  });
  Socket.on('updateGifDeck', function (newDeck) {
    deck.gif = newDeck;
  });

  $scope.allPlayers.forEach(function (p, i) {
    $scope.dealToPlayer(i, 8);
  });

  //QUESTION PHASE BEGIN;
  $scope.phase = 'question';


  Socket.on('changeQuestion', function (questionDeck) {
    deck.questions = questionDeck;
    $scope.questionDeck = deck.questions;
    $scope.$digest();
  });
  // frist time timer.
  $timeout(function () {
    if ($scope.primaryPlayerIndex !== $scope.dealerIndex) {

      let time = cpu ? timerTime.cpu : timerTime.round;
      $scope.timer = new Timer((cpu ? 2 : 45), function () {
        var random = Math.floor(Math.random() * $scope.allPlayers[$scope.primaryPlayerIndex].hand.length);
        var randomCard = $scope.allPlayers[$scope.primaryPlayerIndex].hand[random];
        console.log("random card", randomCard);
        $scope.chooseGif(randomCard);
      }, function () {
        $scope.$digest();
      });
    }
  }, 0);

  Socket.on('doCleanupPhase', function (card) {
    $('#hand-block > h1').html("You're the Dealer");
    $scope.allPlayers.forEach(function (p, i) {
      $scope.dealToPlayer(i, (8 - p.hand.length));
    });

    if (card === null) {
      // Dealer did not select
      // Dealer looses a point!
      var dealerWasCpu = $scope.allPlayers[$scope.dealerIndex].cpu;
      if ($scope.isDealer()) {
        if (!dealerWasCpu) {
          GameModal.open({icon: 'bomb', header: "You've lost a point!", message: "Next time choose a card!"});
          $scope.allPlayers[$scope.dealerIndex].score -= 1;
        }
      } else {
        if (dealerWasCpu) {
          GameModal.open({message: "The dealer has turned into a CPU, and robots have no business in human card-choosing matters..."});
        }
        GameModal.open({header: "The dealer didn't choose a card.", message: "Don't worry, (s)he was rightly punished"});
      }
      $scope.winningCard = null;
    }
    else if (card !== 'dealerDisconnect') {
      // if card does equal dealerDisconnect, we can just skip this block
      var winnerIndex = _.findIndex($scope.allPlayers, {_id: card.player._id});

      if ($scope.primaryPlayerIndex === winnerIndex) {
        GameModal.open({type: 'plusOne'});
      }

      else if ($scope.primaryPlayerIndex !== $scope.dealerIndex) {
        GameModal.open({ type: "miss", winner: $scope.allPlayers[winnerIndex].name })
        $scope.$digest();
        // alert("The dealer has chosen " + $scope.allPlayers[winnerIndex].name + "'s card.\n" +
        //   randomItem(roundLooseMsgs));
      }
      $scope.allPlayers[winnerIndex].score += 1;
      if ($scope.primaryPlayerIndex === $scope.winnerIndex) {
        $scope.isWinner = true;
      }
      $scope.winningCard = card;
    }

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
    if ($scope.revealReady) {
      $scope.timer.stop();
      Socket.emit('revealPicks');
    }
  };
  Socket.on('revealPicks', function () {
    $scope.pickedCards = _.shuffle($scope.pickedCards);
    $scope.showPicks = true;
    if ($scope.isDealer()) {
      $scope.revealReady = false;
      $('#hand-block > h1').html('Select the champion.');

      var timeUpFn = function () {
        $scope.phase = 'cleanup';
        Socket.emit('doCleanupPhase', null);
      };
      $scope.timer.stop();
      let time = cpu ? timerTime.cpu : timerTime.choose;
      $scope.timer = new Timer(60, timeUpFn, function () {
        $scope.$digest()
      });
    }
    $scope.$digest()
  });
  //GAME PLAY HELPER FUNCTIONs

  Socket.on('up');

  //when player chooses a card during question phase
  $scope.chooseGif = function (card, cpuInvoked) {
    if (!cpuInvoked) me.cpu = false;
    console.log("myPick", $scope.myPick);
    console.log("dealer", $scope.isDealer());
    $scope.endHover();
    $scope.timer.stop();

    if (!$scope.myPick && !$scope.isDealer() && $scope.phase === 'question') {
      $scope.myPick = card;
      _.remove($scope.allPlayers[$scope.primaryPlayerIndex].hand, {imageUrl: card.imageUrl});
      console.log("new gif deck", $scope.allPlayers[$scope.primaryPlayerIndex].hand);
      card.player = $scope.primaryPlayer;
      Socket.emit('chooseGif', card)
    }
  };
  Socket.on('chooseGif', function (card) {
    //$scope.chosenGifs++
    $scope.pickedCards.push(card);
    // console.log("chosenGifs", $scope.chosenGifs)
    if ($scope.pickedCards.length === $scope.allPlayers.length - 1) {
      Socket.emit('revealReady')
    }
    $scope.$digest();
  });

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
    hoverDelay = setTimeout(() => {
      if (stillHere !== this) return;
      var e = $event;
      console.log("event", $event);
      var xOffset = xoff;
      var yOffset = yoff;
      this.t = this.title;
      this.title = "";
      var c = (this.t != "") ? "<br/>" + this.t : "";
      console.log("gif", this.card.imageUrl);
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

  Socket.on('revealReady', function () {

    //dealer must click the button!
    if ($scope.isDealer()) {

      //TODO remrve when cpu io implimented
      $scope.timer = new Timer(8, $scope.revealPicks, function () {
        $scope.$digest();
      });
    }

    $scope.revealReady = true;
    $scope.phase = 'selection';
    $scope.$digest();
    Socket.emit('updateOnePlayerStats', $scope.allPlayers, $scope.primaryPlayerIndex);
  });
  $scope.dealerButtonText = function () {
    if ($scope.revealReady) {
      return "REVEAL!"
    }
    else {
      var remaining = ($scope.allPlayers.length - $scope.pickedCards.length - 1);
      return "waiting on " +
        remaining +
        " submission" + (remaining === 1 ? "" : "s") + ".";
    }
  };
  //SELECTION PHASE
  //here the dealer is able to click on a card he/she likes and it is recorded for
  //point awards in cleanup.
  $scope.dealerSelection = function (card) {
    if ($scope.phase === 'selection' && $scope.showPicks && $scope.isDealer()) {
      $scope.phase = 'cleanup';
      $scope.timer.stop();
      Socket.emit('doCleanupPhase', card);
    }
    //CLEANUP PHASE
    //$scope.toQuestionPhase = function () {
    //    Socket.emit('toQuestionPhase');
    //    //wait for all players to be ready
    //};
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
    if ($scope.phase !== 'cleanup') {
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

  Socket.on('removePlayer', function (mongooseId) {
    //TODO this will be for when we have cpuz
    //var targetPlayer = _.find($scope.allPlayers, {'_id': mongooseId});
    //targetPlayer.cpu = true;
    //let firstHumanIdx = _.findIndex($scope.allPlayers, {'cpu': false});
    //if(firstHumanIdx === -1) {
    //    Socket.emit('killGame');
    //    return;
    //}
    //if($scope.primaryPlayerIndex === firstHumanIdx){
    //    alert('ueouoehacuroh');
    //    let firstHuman = true;
    //}

    // remove disconnected players and make sure all
    // local idxs still lines up with new array
    let split = _.findIndex($scope.allPlayers, {'_id': mongooseId});
    if ($scope.primaryPlayerIndex > split) $scope.primaryPlayerIndex--;
    $scope.allPlayers.splice(split, 1);
    //a player that has not submitted a card disconnects

    console.log("NEW PLAYERS", $scope.allPlayers);

    //if the disconnected user added a card, remove it
    _.remove($scope.pickedCards, (c) => c.player._id === mongooseId);

    // we have one less player
    if ($scope.pickedCards.length === $scope.allPlayers.length - 1) {
      Socket.emit('revealReady');
    }

    // check to see if disconnected user is the dealer
    
    if( !(_.find($scope.allPlayers, {"_id": mongooseId, "currentStatus": "DEALER"})) ){
      let mySubmittedCard = _.find($scope.pickedCards, { "player._id": me._id});
      console.log('the card back', mySubmittedCard);
      $scope.allPlayers[$scope.primaryPlayerIndex].hand.push(mySubmittedCard);
      $scope.phase = 'cleanUp';
      Socket.emit('doCleanupPhase', 'dealerDisconnect')
    }
        
    $scope.$digest();

  })
});