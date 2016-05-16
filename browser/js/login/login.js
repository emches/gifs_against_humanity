app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl',
        resolve: {
            rooms: function(GameFactory){
                return GameFactory.getGames();
            }
        }
    });

});

app.controller('LoginCtrl', function ($scope, rooms, Socket, $window, AuthService, $state, GameFactory, UserFactory, GifFactory, QuestionFactory) {

    var mySocketId;
    var me;
    var roomName;
    var gameStarted = false;
    var myRoom;

    $scope.readyForUsername = false;
    $scope.header = "GIFS AGAINST HUMANITY";
    $scope.login = {};
    $scope.error = null;
    $scope.userCount = 0;
    $scope.userConnections = 0;
    $scope.playerMinimum;
    $scope.submitted = false;
    $scope.submitBtnText = "ADD USER";
    $scope.entryType=null;
    $scope.rooms = rooms
    $scope.selectedRoom=false;
    $scope.allPlayers = [];

    Socket.on('connect', function (socket) {
        console.log("I HAVE CONNECTED");
        Socket.emit('newConnection');
    });

    Socket.on('newConnection', function(){
        $scope.userConnections++;
        if($scope.userConnections === $scope.playerMinimum) Socket.emit('readyForUsername');
    });

    Socket.on('readyForUsername', function(){
        $scope.readyForUsername = true;
        console.log("READY??", $scope.readyForUsername);
        $scope.$digest();
    });




    $scope.getRemaining = function () {
        return $scope.playerMinimum - $scope.userCount - 1;
    };

    $scope.sendLogin = function (loginInfo) {
        $scope.error = null;

        AuthService.login(loginInfo).then(function () {
            $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });
    };


    // might be deprecated
    $scope.addUser = function () {
        if(/[^\w\d\s]+/g.test($scope.newUser)){
            $scope.newUser = "";
            return $window.alert("ALPHA-NUMERIC-SPACE CHARACTERS ONLY!");
        }
        if ($scope.allPlayers.length > 2) {
            return $window.alert("ROOM FULL SORRY!!!");
        }
        if ($scope.allPlayers.indexOf($scope.newUser) > -1) {
            return $window.alert("USER ALREADY EXISTS");
        }
        $scope.submitted = true;
        roomName = $scope.newRoom
        var isCpu = /CPU/.test($scope.newUser);
        me = UserFactory.createTempPlayer($scope.newUser, isCpu);
        $scope.allPlayers.push(me);
        $scope.userCount++;
        Socket.emit('newPlayer', $scope.allPlayers, $scope.userCount, me._id);

    };

    $scope.addUserToRoom = function () {
        if(/[^\w\d\s]+/g.test($scope.newUser)){
            $scope.newUser = "";
            return $window.alert("ALPHA-NUMERIC-SPACE CHARACTERS ONLY!");
        }
        if ($scope.selectedRoom.players.length >= $scope.selectedRoom.playerCount) {
            return $window.alert("ROOM FULL SORRY!!!");
        }
        if ($scope.allPlayers.indexOf($scope.newUser) > -1) {
            return $window.alert("USER ALREADY EXISTS");
        }
        console.log("entered: ", $scope.enteredPW)
        console.log("correct: ", $scope.selectedRoom.password)
        if ($scope.enteredPW !== $scope.selectedRoom.password){
            alert("Wrong Password! Try Again, Bud")
            return;
        }

        $scope.submitted = true;
        UserFactory.addUser($scope.newUser)
            .then(function (user) {
                user.currentStatus = "PLAYER";
                $scope.userCount += 1;
                $scope.allPlayers.push(user);
                me = user;
               return GameFactory.addUserToRoom(me, $scope.selectedRoom._id)
            }).then(function(room){
                console.log("room", room.data)
                $scope.userCount = room.data.players.length
                $scope.playerMinimum = room.data.playerCount
                console.log("userCount", $scope.userCount)
                console.log("playerMinimum", $scope.playerMinimum)
                $scope.allPlayers = room.data.players
                console.log("allPlayers", $scope.allPlayers)
                $scope.joinedRoom = true;
                console.log("joinedRoom", $scope.joinedRoom)
               // debugger
                //$scope.myRoom = room.data;
                $scope.joinedRoom = true;
                Socket.emit('joinRoom', room.data);
                //debugger

            })
    };

    Socket.on('removePlayer', function(removedId){
        if(gameStarted) return;

        console.log("REMVOED ID", removedId);
        var split = _.findIndex($scope.allPlayers, {'_id': removedId});
        $scope.allPlayers.splice(split, 1);
        console.log("NEW PLAYERS", $scope.allPlayers);
        $scope.$digest();
    });

    // might be deprecated
    // $scope.joinRoom = function () {
    //     var gifDeck;
    //     GifFactory.constructApiDeck()
    //         .then(deck => gifDeck = deck)
    //         .then(() => QuestionFactory.constructQuestionDeck())
    //         .then(questionDeck => GifFactory.saveConstructedDecks(questionDeck, gifDeck))
    //         .then(function(savedDeck) {
    //             console.log("saved", savedDeck);
    //             console.log("roomName", roomName)
    //             return GameFactory.createRoom(savedDeck, me, roomName)
    //         })
    //         .then(function(response){
    //             console.log("passed saved", response.data)
    //             Socket.emit('joinRoom', response.data);
    //         });
    // };

    $scope.joinRoom = function(){
        Socket.emit('gameStart', myRoom)
        $state.go('home', {
            allPlayers: $scope.allPlayers,
            me: me,
            deckId: myRoom.deck,
            room: myRoom
        });
    }


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

    $scope.showEntryForm = function(form){
        $scope.entryType=form;
    }

    $scope.dropboxitemselected = function (item) {
        $scope.selectedRoom = item;
       // alert($scope.selectedRoom);
    }

    // might be dep
    // Socket.on('gameStart', function (deckId, socketId) {
    //     gameStarted = true;
    //     console.log("NEW VARS", deckId);
    //     console.log("PLAYERS", $scope.allPlayers);
    //     $state.go('home', {
    //         allPlayers: $scope.allPlayers,
    //         me: me,
    //         deckId: deckId,
    //         socketId: socketId
    //     });
    // });

   Socket.on('gameStart', function (room, socketId) {
        console.log("starting", room.deck)
        $state.go('home', {
            allPlayers: $scope.allPlayers,
            me: me,
            deckId: room.deck,
            room: room,
            socketId: socketId
        });
    });

    Socket.on('updateRooms', function () {
        console.log("GOT IT UPDATING", $scope);
        GameFactory.getGames()
            .then(function(games){
                $scope.rooms = games
                //debugger;
                //$scope.$digest();
            });

        // if ( !$scope.joinedRoom) {
        //     console.log("updating state", $scope.joinedRoom)
        //     $state.reload();
        // }
    });
    // from create room
    // Socket.on('gameStart', function (room) {
    //     console.log("starting", room.deck)
    //     $state.go('home', {
    //         allPlayers: $scope.allPlayers,
    //         me: me,
    //         deckId: room.deck,
    //         room: room
    //     });
    // });

    Socket.on('newPlayer', function (allPlayers, userCount, socketId) {
        var plural = $scope.getRemaining() === 1 ? "s." : ".";
        if ($scope.submitted) {
            $scope.submitBtnText = "Waiting for others..."
        }
        $scope.allPlayers = allPlayers;
        $scope.userCount = userCount;
        console.log("users", $scope.userCount, "allPlayers", $scope.allPlayers)
        if ($scope.userCount >= $scope.playerMinimum) $scope.header = "READY TO PLAY";
        $scope.newUser = "";
        $scope.$digest()
        mySocketId = socketId;
    });

    // Moved from create room js
    Socket.on('newPlayerTest', function (room) {
        console.log("GOT IT!!!", room)
        $scope.allPlayers = room.players;
        $scope.playerMinimum = room.playerCount;
        $scope.$digest();
    });



});
