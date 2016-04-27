app.directive('gifCard', function () {
    return {
        scope: {
            theCard: '=',
            isDealer: '=',
            hover: '=',
            leave: '='
        },
        restrict: 'E',
        templateUrl: 'js/common/directives/cards/card.html'
    };
});