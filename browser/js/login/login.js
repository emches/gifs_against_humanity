app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });

});

app.controller('LoginCtrl', function ($scope, Socket, $window, AuthService, $state, GameFactory, UserFactory, GifFactory, QuestionFactory) {

    Socket.on('connect', function () {
        Socket.emit('newConnection');
    });
    Socket.on('newConnection', function(){
        $scope.userConnections++;
        if($scope.userConnections === $scope.playerMinimum) Socket.emit('readyForUsername');
    });

    $scope.readyForUsername = false;
    $scope.header = "GIFS AGAINST HUMANITY";
    $scope.login = {};
    $scope.error = null;
    $scope.userCount = 0;
    $scope.userConnections = 0;
    $scope.playerMinimum = 2;
    $scope.submitted = false;
    $scope.submitBtnText = "ADD USER";
    $scope.getRemaining = function () {
        return $scope.playerMinimum - $scope.userCount - 1;
    };
    Socket.on('readyForUsername', function(){
        $scope.readyForUsername = true;
        $scope.$digest();
    });
    $scope.sendLogin = function (loginInfo) {
        $scope.error = null;

        AuthService.login(loginInfo).then(function () {
            $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });
    };

    $scope.allPlayers = [];
    var me;
    var roomName;
    $scope.myTest = function(){
        console.log("ASDFASDFASD")
    }
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
        UserFactory.addUser($scope.newUser)
            .then(function (user) {
                user.currentStatus = "PLAYER";
                $scope.userCount += 1;
                $scope.allPlayers.push(user);
                me = user;
                Socket.emit('newPlayer', $scope.allPlayers, $scope.userCount);
            })
    };

    $scope.joinRoom = function () {
        var gifDeck;
        GifFactory.constructApiDeck()
            .then(deck => gifDeck = deck)
            .then(() => QuestionFactory.constructQuestionDeck())
            .then(questionDeck => GifFactory.saveConstructedDecks(questionDeck, gifDeck))
            .then(function(savedDeck) {
                console.log("saved", savedDeck);
                console.log("roomName", roomName)
                return GameFactory.createRoom(savedDeck, me, roomName)

            })
            .then(function(response){
                console.log("passed saved", response.data)
                Socket.emit('joinRoom', response.data);
            });
    };

    $scope.rooms = []
    $scope.selectedRoom = "Please Select a Room!"

    $scope.createRoom = function () {
        console.log("adding room")
        var gifDeck;
        UserFactory.addUser($scope.newUser)
            .then(function (user) {
                user.currentStatus = "PLAYER";
                $scope.userCount += 1;
                $scope.allPlayers.push(user);
                me = user;
            })
        .then(function(){
            GifFactory.constructApiDeck()
            })
            .then(deck => gifDeck = deck)
            .then(() => QuestionFactory.constructQuestionDeck())
            .then(questionDeck => GifFactory.saveConstructedDecks(questionDeck, gifDeck))
            .then(function(savedDeck) {
                console.log("saved", savedDeck);
                console.log("user", me)
                return GameFactory.createRoom(savedDeck, me, $scope.createdRoom)

            })
            .then(function(response){
                console.log("passed saved", response.data)
                $scope.rooms.push($scope.createdRoom.name)
                Socket.emit('joinRoom', response.data);
            });
    };

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
