app.directive('gifCard', function () {
    return {
        restrict: 'E',
        scope: {
            theCard: '='
        },
        templateUrl: 'js/common/directives/cards/card.html',
    };
});
