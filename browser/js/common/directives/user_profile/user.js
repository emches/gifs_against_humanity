app.directive('player', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

    return {
        restrict: 'E',
        scope: {
            playerInfo: '=',
            myId: '='
        },
        templateUrl: 'js/common/directives/user_profile/user.html',
        link: function(scope){
        }
    };

});

app.factory('UserFactory', function($http) {
    return {
        fetchById: function(id) {
            return $http.get('/api/users/' + id)
                .then(function(response) {
                    return response.data;
                });
        },
        fetchAll: function() {
            return $http.get('/api/users')
                .then(function(response) {
                    return response.data;
                });
        },
        addUser: function(username) {
            return $http.post('/api/users', {username: username} )
                .then(function(response) {
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
