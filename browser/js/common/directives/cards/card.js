app.directive('gifCard', function () {
    return {
        scope: {
            theCard: '=',
            isDealer: '=',
        },
        restrict: 'E',
        templateUrl: 'js/common/directives/cards/card.html'
    };
});