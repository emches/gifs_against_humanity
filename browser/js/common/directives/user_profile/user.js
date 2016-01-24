app.directive('player', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

    return {
        restrict: 'E',
        scope: {
            playerInfo: '=',
            myId: '='
        },
        templateUrl: 'js/common/directives/user_profile/user.html',
        link: function(scope){
            console.log("SCOPE", scope);
            console.log("PLAYER INFO", scope.playerInfo);
        }

    };

});

app.factory('UserFactory', function($http) {
    return {
        fetchById: function(id) {
            return $http.get('/api/users/' + id)
                .then(function(response) {
                    console.log("response", response.data);
                    return response.data;
                });
        },
        fetchAll: function() {
            return $http.get('/api/users')
                .then(function(response) {
                    console.log("response", response.data);
                    return response.data;
                });
        },
        addUser: function(username) {
            return $http.post('/api/users', {username: username} )
                .then(function(response) {
                    console.log("response", response.data);
                    return response.data;
                });
        },
    }
});

app.controller('UserController', function($scope, UserFactory) {

    UserFactory.fetchAll()
        .then(function(users){
            $scope.players = users;


        });
});
