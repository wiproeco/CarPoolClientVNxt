
var app = angular.module('myApp', ['ngRoute']);

app.config(['$routeProvider',
  function ($routeProvider) {
      $routeProvider.
        when('/NewDashboard', {
            $templateUrl: 'views/NewDashboard.html',
            controller: 'dashboardCtrl'
        }).
        when('/Joinride', {
            templateUrl: 'views/Joinride.html',
            controller: 'JoinrideCtrl'
        }).
        when('/ownernotification', {
            templateUrl: 'views/ownernotification.html',
            controller: 'ownernotificationCtrl'
        }).
        when('/usernotification', {
            templateUrl: 'views/usernotification.html',
            controller: 'usernotificationCtrl'
        }).
        when('/newride', {
            templateUrl: 'views/Newride.html',
            controller: 'newRideCtrl'
        }).
        when('/ownerrides', {
            templateUrl: 'views/Ownerrides.html',
            controller: 'ownerridesCtrl'
        }).
        otherwise(
        {
            templateUrl: 'views/NewDashboard.html',
            controller: 'dashboardCtrl'
        }
        );
  }]);

//This is used for landing page after login (dashboard)
// Serviceurl is a constant where the path is given
// $location is used to dynamically set the path of the views

app.controller('homecontroller', ['$scope', '$http', '$window', 'Serviceurl', '$location', '$rootScope', 'userfactory', function ($scope, $http, $window, Serviceurl, $location, $rootScope, userfactory) {
    navigationLinks($scope, $http, $window, Serviceurl, $location);
    $rootScope.IsOwner = window.localStorage.getItem("isowner"); // to store usertype
    $rootScope.IsError = false; // this is used to show and hide the error divs
}]);

//function homecontroller($scope, $http, $window, Serviceurl, $location, $rootscope) {
//    navigationLinks($scope, $http, $window, Serviceurl, $location);

//};

function navigationLinks($scope, $http, $window, Serviceurl, $location) {

    $scope.MyDashboard = function () {
        window.location.href = "NewDashboard.html";
    }

    $scope.MyNotifications = function () {
        var isowner = window.localStorage.getItem("isowner");
        var notificationurl = '';

        if (isowner == "true")
            notificationurl = "/ownernotification";
        else
            notificationurl = "/usernotification";

        $location.path(notificationurl);
    }

    $scope.ShareRide = function () {

        window.location.href = "addmarker.html";
    }

    $scope.MyRides = function () {

        window.location.href = "myrides.html";
    }

    $scope.logOut = function () {
        window.localStorage.setItem("userid", 0);
        window.location.href = 'index.html';
    }
}

function PushNotifications(notificationurl, $rootScope) {
    //var notificationurl = "http://wiprocarpool.azurewebsites.net/";
    var isowner = window.localStorage.getItem("isowner");
    var userId = window.localStorage.getItem("userid");
    var todayDate = new Date();
    var date = todayDate.getFullYear() + "-" + (todayDate.getMonth() + 1) + "-" + todayDate.getDate();

    var totaltimeout = 5;
    
    if (isowner == "true") {
        var latitude = "";
        var longitude = "";
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                latitude = position.coords.latitude.toString();
                longitude = position.coords.longitude.toString();
                notificationurl = notificationurl + "/getnotitifications/" + userId + "/" + date.toString() + "/" + latitude + "/" + longitude;
                totaltimeout = 15;
                $("#MyNotifications").css("color", "green");
                NotificationClientService.AutomaticNotifications(notificationurl, 2, totaltimeout, null, NoticationCallback);
            });
        }
    }
    else {
        notificationurl = notificationurl + "/receivenotitifications/" + userId;
        $("#MyNotifications").css("color", "green");
        NotificationClientService.AutomaticNotifications(notificationurl, 2, totaltimeout, null, NoticationCallback);
    }
}

function NoticationCallback(data) {
    var isowner = window.localStorage.getItem("isowner");

    if (data != undefined && data != null && data.data.length > 0) {
        if (isowner == "true") {
            $("#MyNotifications").css("color", "red");
            CancelNotification.Clear(NotificationClientService.RefreshIntervalId);
        }
        else {
            if (data.data[0].status == "pending") {
                $("#MyNotifications").css("color", "yellow");
            }
            else {
                $("#MyNotifications").css("color", "red");
                CancelNotification.Clear(NotificationClientService.RefreshIntervalId);
            }
        }
    }
}



