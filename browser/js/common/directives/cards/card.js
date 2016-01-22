app.directive('gifCard', function () {
    return {
        scope: {
            theCard: '='
        },
        restrict: 'E',
        templateUrl: 'js/common/directives/cards/card.html'
    };
});