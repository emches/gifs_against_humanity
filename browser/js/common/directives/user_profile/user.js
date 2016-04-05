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
            // if using this, will need to add the `currentStatus` property from the promise.
            return $http.post('/api/users', {username: username} )
                .then(function(response) {
                    console.log("response", response.data);
                    return response.data;
                });
        },
        createTempPlayer: function(username, isCpu){

            var stock = [
                {"avatarUrl": "http://www.avatarsdb.com/avatars/shoe_kitten.gif", "status": "Not enough Beyonce GIFs", "used": false },
                {"avatarUrl": "http://www.avatarsdb.com/avatars/prittiest_kitten.jpg", "status": "My Deck is Amazing!", "used": false },
                {"avatarUrl": "http://www.avatarsdb.com/avatars/kitty_funny.jpg", "status": "Mine not so much lol", "used": false },
                {"avatarUrl": "http://www.avatarsdb.com/avatars/angry_glance.jpg", "status": "Hi!!!", "used": false },
                {"avatarUrl": "http://www.avatarsdb.com/avatars/pink_hair_cat.jpg", "status": "Womp", "used": false },
                {"avatarUrl": "http://www.avatarsdb.com/avatars/beanie_cat.jpg", "status": "!#$%@%", "used": false },

            ];

            return {
                _id: "TEMP_" + username + Math.random().toString().replace(".",""),
                name: username,
                imageURL: isCpu ? "https://m1.behance.net/rendition/modules/37391421/disp/5aef99e766860cae8699633560a4a2ab.jpg"
                    : stock[Math.floor(Math.random() * stock.length)].avatarUrl,
                email: "null@undefined.nan",
                score: 0,
                myturn: false,
                cpu: !!isCpu,
                hand: [],
                currentStatus: "PLAYER",
                status: stock[Math.floor(Math.random() * stock.length)].status,
            }
        }

    }
});

app.controller('UserController', function($scope, UserFactory) {

    UserFactory.fetchAll()
        .then(function(users){
            $scope.players = users;


        });
});
