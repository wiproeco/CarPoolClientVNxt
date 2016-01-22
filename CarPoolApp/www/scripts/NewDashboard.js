app.controller('dashboardCtrl', function ($scope, $http, $window, Serviceurl, $location, $rootScope) {
    $scope.IsOwner = $rootScope.IsOwner;
    $scope.userName = localStorage.getItem("username");
    $scope.IsownerSelection = localStorage.getItem("isownerSelection");
    $scope.isOwnerForNotification = window.localStorage.getItem("isowner");

    if ($scope.IsOwner == "false" && $scope.IsownerSelection == "true")
    {
        $location.path("/updateprofiletoowner");
        window.localStorage.setItem("isownerSelection", "");
    }

    PushNotifications(Serviceurl, $rootScope);
});