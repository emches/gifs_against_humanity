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








});
