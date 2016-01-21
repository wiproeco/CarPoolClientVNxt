
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
        when('/ridedetails', {
            templateUrl: 'views/ridedetails.html',
            controller: 'myRideDetailsCtrl'
        }).
        when('/updateprofiletoowner', {
            templateUrl: 'views/UpdateProfiletoOwner.html',
            controller: 'updateProfiletoOwnerCtrl'
        }).
        when('/updateprofile', {
            templateUrl: 'views/UpdateProfile.html',
            controller: 'UpdateCntrl'
        }).
        when('/changepassword', {
            templateUrl: 'views/Changepassword.html',
            controller: 'UpdateCntrl'
        }).
       when('/rideshistory', {
           templateUrl: 'views/rideshistory.html',
           controller: 'ridesHistoryCtrl'
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
    $rootScope.loginAsOwnerOrNot = window.localStorage.getItem("loginAsOwnerOrNot");
    $rootScope.IsOwner = window.localStorage.getItem("isowner"); // to store usertype
    $rootScope.IsError = false;
    $rootScope.userName = window.localStorage.getItem("username");// this is used to show and hide the error divs
}]);

//function homecontroller($scope, $http, $window, Serviceurl, $location, $rootscope) {
//    navigationLinks($scope, $http, $window, Serviceurl, $location);

//};




function navigationLinks($scope, $http, $window, Serviceurl, $location) {

    $scope.MyDashboard = function () {

        $location.path("NewDashboard.html");
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
        $location.path("addmarker.html");
    }

    $scope.MyRides = function () {
        $location.path("/ownerrides");
    }

    $scope.JoinRide = function () {
        $location.path("/Joinride");
    }

    $scope.RidesHistory = function () {
        $location.path("/rideshistory");
    }

    $scope.UpdateProfile = function (name) {
        $location.path("/updateprofile");
        //window.location.href = "UpdateProfile.html";
    }

    $scope.ChangePassword = function () {
        //window.location.href = "Changepassword.html";        
        $location.path("/changepassword");
    }

    $scope.logOut = function () {
        window.localStorage.setItem("userid", 0);
        window.location.href = 'index.html';
    }
}

function PushNotifications(notificationurl, $rootScope) {
    var isowner = window.localStorage.getItem("isowner");
    var userId = window.localStorage.getItem("userid");
    var todayDate = new Date();
    var date = todayDate.getFullYear() + "-" + (todayDate.getMonth() + 1) + "-" + todayDate.getDate();

    var totaltimeout = 5;
    var currentdate = moment().format('MM-DD-YYYY');

    if (isowner == "true") {
        var latitude = "";
        var longitude = "";
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                latitude = position.coords.latitude.toString();
                longitude = position.coords.longitude.toString();
                notificationurl = notificationurl + "/getnotitifications/" + userId + "/" + currentdate + "/" + latitude + "/" + longitude;
                totaltimeout = 15;
                $("#MyNotifications").css("color", "green");
                NotificationClientService.AutomaticNotifications(notificationurl, 2, totaltimeout, null, NoticationCallback);
            });
        }
    }
    else {
        notificationurl = notificationurl + "/receivenotitifications/" + userId + "/" + currentdate;
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

app.controller('updateProfiletoOwnerCtrl', function ($scope, $http, $window, $filter, $location, Serviceurl) {
    $scope.processing = false;
    $scope.seats = 1;

    $scope.Cancel = function () {
        alert("test1");
        $location.path("#");
    }

    $scope.Upgrade = function () {
        // $location.path("NewDashboard.html");
        //alert("test");
        window.localStorage.setItem("isowner", true);
        $('#myModal').modal('show');
        // window.location.href = 'home.html';

    }

    $scope.Success = function () {
        window.location.href = 'home.html';
    }
});



