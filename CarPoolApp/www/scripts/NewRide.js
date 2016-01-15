app.controller('newRideCtrl', function ($scope, $http, $window) {
    $("#errormsg").hide();
    $("#errordiv").hide();
    $scope.userName = localStorage.getItem("username");
    navigationLinks($scope, $http, $window);
});