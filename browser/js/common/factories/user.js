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
        }
    }
});
