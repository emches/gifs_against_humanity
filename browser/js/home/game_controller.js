app.controller('GameController', function ($scope, GifFactory, QuestionFactory) {

    //GAME INITILIZATION
    //player seating
    $scope.primaryPlayer = {
        name: "Nick2", //TODO remove hard code.
        hand: []
    };
    $scope.seats = [$scope.primaryPlayer];

    //construct Gif deck
    $scope.gifDeck = [];
    GifFactory.constructApiDeck()
        .then(deck => $scope.gifDeck = deck);
    $scope.dealToSeat = function (n) {
        var theHand = $scope.seats[n].hand;
        theHand.push($scope.gifDeck.shift());
    };

    //construct Question Deck
    $scope.questionDeck = [];
    QuestionFactory.constructQuestionDeck()
        .then(deck => $scope.questionDeck = deck);


    //the "Table"
    $scope.currentQuestion = null;
    $scope.submittedGifs = [];

});
