app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });

});

app.controller('LoginCtrl', function($scope, $window, AuthService, $state, UserFactory) {

    $scope.login = {};
    $scope.error = null;
    $scope.userCount = 0
    $scope.roomReady = false;

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo).then(function () {
            $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });

    };

    $scope.allPlayers = [];

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
                $scope.allPlayers.push(user)
                console.log("new count", $scope.userCount)
                if ($scope.userCount===6){ $scope.roomReady= true}
            })

   }

      $scope.joinRoom = function(){

        $state.go('home', { allPlayers: $scope.allPlayers});
      }

});