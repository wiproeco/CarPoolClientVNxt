app.controller('dashboardCtrl', function ($scope, $http, $window, Serviceurl, $location, $rootScope) {
    $scope.IsOwner = $rootScope.IsOwner;       
    $scope.userName = localStorage.getItem("username");
    $scope.isOwnerForNotification = window.localStorage.getItem("isowner");
    PushNotifications(Serviceurl, $rootScope);
});