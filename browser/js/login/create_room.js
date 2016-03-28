app.config(function ($stateProvider) {

    $stateProvider.state('create', {
        url: '/create',
        templateUrl: 'js/login/create_room.html',
        controller: 'CreateRoomCtrl'
    });

});

app.controller('CreateRoomCtrl', function ($scope, Socket, $window, AuthService, $state, GameFactory, UserFactory, GifFactory, QuestionFactory) {
    console.log("SCOPE", $scope)
    $scope.header = "GIFS AGAINST HUMANITY";
    $scope.error = null;
    $scope.userCount = 0;
    $scope.userConnections = 0;
    $scope.allPlayers = [];
    $scope.playerMinimum;
    $scope.getRemaining = function () {
        return $scope.playerMinimum - $scope.userCount - 1;
    };

    $scope.submitted = false;
    $scope.submitBtnText = "ADD USER";

    var me;
    var roomName;

    $scope.createRoom = function () {
        var gifDeck;
        if(/[^\w\d\s]+/g.test($scope.newUser)){
            $scope.newUser = "";
            return $window.alert("ALPHA-NUMERIC-SPACE CHARACTERS ONLY!");
        }
        UserFactory.addUser($scope.newUser)
            .then(function (user) {
                console.log("ASDFASDFSD")
                user.currentStatus = "PLAYER";
                $scope.userCount += 1;
                $scope.allPlayers.push(user);
                console.log("allPlayers1", $scope.allPlayers)
                me = user;
               // debugger;
               // Socket.emit('newPlayer', $scope.allPlayers, $scope.userCount);
            })
            .then(function(){
                GifFactory.constructApiDeck()
                    .then(deck => gifDeck = deck)
                    .then(() => QuestionFactory.constructQuestionDeck())
                    .then(questionDeck => GifFactory.saveConstructedDecks(questionDeck, gifDeck))
                    .then(function(savedDeck) {
                      console.log("saved", savedDeck);
                        console.log("roomName", roomName)
                        return GameFactory.createRoom(savedDeck, me, $scope.createdRoom)
                     })
                    .then(function(response){
                         console.log("passed saved", response.data)
               // $scope.allPlayers.push(me)
                     console.log("me", me)
                        console.log("all", $scope.allPlayers)
                        $scope.playerMinimum = response.data.playerCount
                      Socket.emit('joinRoom', response.data);
                    });
            });
    };

     Socket.on('newPlayerTest', function (room) {
        console.log("GOT IT!!!", room)
        $scope.allPlayers = room.players;
        $scope.playerMinimum = room.playerCount;
        $scope.$digest();
    });


    Socket.on('gameStart', function (room) {
        console.log("starting", room.deck)
        $state.go('home', {
            allPlayers: $scope.allPlayers,
            me: me,
            deckId: room.deck,
            room: room
        });
    });

    Socket.on('newPlayer', function (allPlayers, userCount) {
        var plural = $scope.getRemaining() === 1 ? "s." : ".";
        if ($scope.submitted) {
            $scope.submitBtnText = "Waiting for others..."
        }
        $scope.allPlayers = allPlayers;
        $scope.userCount = userCount;
        console.log("users", $scope.userCount, "allPlayers", $scope.allPlayers)
        if ($scope.userCount >= $scope.playerMinimum) $scope.header = "READY TO PLAY";
        $scope.newUser = "";
        $scope.$digest();
    });
});
