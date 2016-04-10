app.factory('GameModal', function($uibModal){

  var roundWinMsgs = ["You rock!", "GIF Game Strong!", "Wow! You seem like someone who definitely knows how to pronounce \"Gif\" correctly", "I love you.", "And I bet that's not even your final form", "Way to go!!", "Mad 1337 skillz there br0", "I'd buy you a drink! But I'm just a function on the window object", "You must have all the friends!", "I'm more than amazed!", "It's like you were born to play this game!", "You might just be \"The One\"", "All will know your name."];
  var roundLooseMsgs = ["", "", "", "", "This means war", "Shot's fired", "This doesn't mean you're not good, it just means that someone is better than you right now", "Okay, buddy. Gloves off.", "There's still time for redemption"];
  var randomItem = function (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  };
  var plusOne = ["http://i1382.photobucket.com/albums/ah279/npalenchar/gah/Level_Up_Logo_zpsbkc8w5iv.gif"];
  var miss = ["http://i1382.photobucket.com/albums/ah279/npalenchar/1264355701_cat_zpsy2vqxeun.gif"];

  return {
    open: function(params){
      var modal = $uibModal.open({
        animation: true,
        templateUrl: "/components/modals/game_modal.html",
        controller: "ModalCtrl",
        resolve: {
          content: function(){
            switch (params.type){
              case "plusOne": return {
                header: "The dealer chose your card!",
                img: randomItem(plusOne),
                message: randomItem(roundWinMsgs),
              };
              case "miss": return {
                header: "The dealer has chosen " + (params.winner || "someone else's") + " card...",
                img: randomItem(miss),
                message: randomItem(roundLooseMsgs),
              };
              case "blank": return {
                header: params.header || '',
                message: params.message || '',
              };
              default: return '';
            }
          }
        }
      });
      modal.closed.then(event => console.log('modal closed', event));
    }
  }
});

app.controller('ModalCtrl', function($scope, $uibModalInstance, $timeout, content){


  $scope.content = content;
  $scope.ok = $uibModalInstance.dismiss;
  $(document).keypress(e => {
    if(e.keyCode === 32) {
      $uibModalInstance.dismiss();
    }
  });
  if(!content.noTimer) {
    // $timeout($uibModalInstance.close, 5000);
  }
});