angular.module('vtms').controller('vtmsProfileController', function($scope, vtmsAuth, vtmsNotifier, vtmsIdentity) {
  $scope.email = vtmsIdentity.currentUser.username;
  $scope.firstName = vtmsIdentity.currentUser.firstName;
  $scope.lastName = vtmsIdentity.currentUser.lastName;
  
  $scope.update = function() {
    var newUserData = {
      username: $scope.email,
      firstName: $scope.firstName,
      lastName: $scope.lastName
    }
    console.log("$scope.update in vtmsProfileController.js");
    console.log(newUserData);
    if($scope.password && $scope.password.length > 0) {
      newUserData.password = $scope.password;
    }
    
    vtmsAuth.updateCurrentUser(newUserData).then(function() {
      vtmsNotifier.notify('Your user account has been updated');
    }, function(reason) {
      vtmsNotifier.error(reason);
    });
  };

});