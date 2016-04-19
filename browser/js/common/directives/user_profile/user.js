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


app.controller('UserController', function($scope, UserFactory) {

    UserFactory.fetchAll()
        .then(function(users){
            $scope.players = users;
        });
});
