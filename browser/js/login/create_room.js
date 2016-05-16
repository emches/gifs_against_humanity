app.config(function ($stateProvider) {

    $stateProvider.state('create', {
        url: '/create',
        templateUrl: 'js/login/create_room.html',
        controller: 'CreateRoomCtrl'
    });

});

app.controller('CreateRoomCtrl', function ($scope, Socket, $window, AuthService, $state, GameFactory, UserFactory, GifFactory, QuestionFactory) {










});
