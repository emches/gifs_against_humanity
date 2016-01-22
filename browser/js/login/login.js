app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });

});

app.controller('LoginCtrl', function($scope, Socket, $window, AuthService, $state, UserFactory) {

    Socket.on('connect', function(){
        console.log("I HAVE CONNECTED")





    })

    $scope.login = {};
    $scope.error = null;
    $scope.userCount = 0


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

    $scope.addUser = function(){
       // $state.go('home', { newUser: $scope.newUser});
       console.log("all", $scope.allPlayers)
       if ($scope.allPlayers.length >5){ return $window.alert("ROOM FULL SORRY!!!"); }
       if ($scope.allPlayers.indexOf($scope.newUser) > -1) { return $window.alert("USER ALREADY EXISTS"); }

        UserFactory.addUser($scope.newUser)
            .then(function(user){
                console.log("got user back", user)
                user.currentStatus = "PLAYER"
               // $scope.allPlayers.push(user)
                //$scope.currentUser = user
               // console.log("new current", $scope.currentUser)
                $scope.userCount+=1;
                $scope.allPlayers.push(user);
                me = user;
                console.log("new count", $scope.userCount);
               // if ($scope.userCount===6){ $scope.roomReady= true}

                Socket.emit('newPlayer', $scope.allPlayers, $scope.userCount);


            })

   }

      $scope.joinRoom = function(){
        console.log("current me", me)
        $state.go('home', { allPlayers: $scope.allPlayers, me: me });
      }

      Socket.on('newPlayerFromServer', function(allPlayers, userCount){
            $scope.allPlayers = allPlayers;
            $scope.userCount = userCount
            console.log("allPlayers", allPlayers)
            console.log("count", userCount)
            $scope.$digest()

      })


});