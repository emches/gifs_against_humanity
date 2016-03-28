app.config(function ($stateProvider) {

    $stateProvider.state('join', {
        url: '/join',
        templateUrl: 'js/login/join_room.html',
        controller: 'JoinRoomCtrl',
        resolve: {
            rooms: function(GameFactory){
                return GameFactory.getGames();
            }
        }
    });

});

app.controller('JoinRoomCtrl', function ($scope, rooms, Socket, $window, AuthService, $state, GameFactory, UserFactory, GifFactory, QuestionFactory) {
    console.log("SCOPE", $scope)
    $scope.rooms = rooms
    $scope.header = "GIFS AGAINST HUMANITY";
    $scope.login = {};
    $scope.error = null;
    $scope.userCount = 0;
    $scope.userConnections = 0;
    $scope.allPlayers = [];
    $scope.playerMinimum = 2;
    $scope.joinedRoom = false;
    $scope.getRemaining = function () {
        return $scope.playerMinimum - $scope.userCount - 1;
    };

    $scope.submitted = false;
    $scope.submitBtnText = "ADD USER";
    $scope.selectedRoom = "Please Select a Room!"

    var me;

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
                Socket.emit('joinRoom', room.data);

            })
    };
     Socket.on('newPlayerTest', function (room) {
        console.log("GOT IT!!!", room)
        $scope.allPlayers = room.players;
        $scope.playerMinimum = room.playerCount;
        $scope.$digest();
    });

     Socket.on('updateRooms', function () {
        console.log("GOT IT UPDATING");
        if ( !$scope.joinedRoom) {
            $state.reload();
        }
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
