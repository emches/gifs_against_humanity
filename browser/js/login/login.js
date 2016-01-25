app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });

});

app.controller('LoginCtrl', function ($scope, Socket, $window, AuthService, $state, UserFactory, GifFactory, QuestionFactory) {

    Socket.on('connect', function () {
        console.log("I HAVE CONNECTED")

    });
    $scope.header = "GIFS AGAINST HUMANITY"
    $scope.login = {};
    $scope.error = null;
    $scope.userCount = 0;
    $scope.playerMinimum = 3;
    $scope.submitted = false;
    $scope.submitBtnText = "ADD USER";
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

    $scope.allPlayers = [];
    var me;

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
        UserFactory.addUser($scope.newUser)
            .then(function (user) {
                user.currentStatus = "PLAYER";
                // $scope.allPlayers.push(user)
                //$scope.currentUser = user
                // console.log("new current", $scope.currentUser)
                $scope.userCount += 1;
                $scope.allPlayers.push(user);
                me = user;
                console.log("new count", $scope.userCount);
                // if ($scope.userCount===6){ $scope.roomReady= true}

                Socket.emit('newPlayer', $scope.allPlayers, $scope.userCount);


            })

    };

    $scope.joinRoom = function () {
        console.log("current me", me);
        var gifDeck;
        GifFactory.constructApiDeck()
            .then(deck => gifDeck = deck)
            .then(() => QuestionFactory.constructQuestionDeck())
            .then(questionDeck => GifFactory.saveConstructedDecks(questionDeck, gifDeck))
            .then(savedDeck => Socket.emit('joinRoom', savedDeck._id));
    };

    Socket.on('gameStart', function (deckId) {

        console.log("NEW VARS", deckId);
        console.log("PLAYERS", $scope.allPlayers);
        $state.go('home', {
            allPlayers: $scope.allPlayers,
            me: me,
            deckId: deckId
        });
    });

    Socket.on('newPlayer', function (allPlayers, userCount) {
        var plural = $scope.getRemaining() === 1 ? "s." : ".";
        if ($scope.submitted) {
            $scope.submitBtnText = "Waiting for others..."
        }
        $scope.allPlayers = allPlayers;
        $scope.userCount = userCount;
        if ($scope.userCount >= $scope.playerMinimum) $scope.header = "READY TO PLAY";
        console.log("allPlayers", allPlayers);
        console.log("count", userCount);
        $scope.newUser = "";
        $scope.$digest()

    })
});