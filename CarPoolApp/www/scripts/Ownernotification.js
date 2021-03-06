﻿app.controller('ownernotificationCtrl', function ($scope, $http, $window,  Serviceurl) {
    $scope.isOwnerNotificationHasData = false;
    var logdetails = {
        userid: "",
        logdescription: "",        
    }
    $scope.IsError = false;
    document.getElementById("Loading").style.display = "block";
    //navigationLinks($scope, $http, $window);
    $scope.notificationdata = "";
    var userId = window.localStorage.getItem("userid");
    $scope.userName = localStorage.getItem("username");
    var currentdate = moment().format('MM-DD-YYYY');
    var latitude = "";
    var longitude = "";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude.toString();
            longitude = position.coords.longitude.toString();

            var url = Serviceurl + "/getnotitifications/" + userId + "/" + currentdate + "/" + latitude + "/" + longitude;
            try {
                $http.get(url)
                        .success(function (response) {
                            var data = JSON.stringify(response);
                            var result = JSON.parse(data);
                            if (result.length > 0) {
                                $scope.notificationdata = result;
                                $scope.isOwnerNotificationHasData = true;
                            }
                            else {
                                $scope.isOwnerNotificationHasData = false;
                            }
                            document.getElementById("Loading").style.display = "none";

                        }).error(function (data, status) {
                            // alert(data);    
                            document.getElementById("Loading").style.display = "none";
                            logdetails.userid = userId;
                            logdetails.logdescription = status;
                            $scope.isOwnerNotificationHasData = false;
                            Errorlog($http, $scope, logdetails, true);
                        });
            } catch (e) {
                logdetails.userid = userId;
                logdetails.logdescription = e.message;
                Errorlog($http,$scope, logdetails, true);
                $scope.isOwnerNotificationHasData = false;
            }
        });
    }
    $scope.updateRideNotification = function (ownerid, rideid, passengerid, bookingstatus,$location) {
        document.getElementById("Loading").style.display = "block";

        var userreqforcurrgeolocnvalue = "";

        if (document.getElementById("chkuserreqforcurrgeolocn").checked)
            userreqforcurrgeolocnvalue = true;
        else
            userreqforcurrgeolocnvalue = false;

        var user = JSON.stringify({
            id: ownerid,
            rideid: rideid,
            userid: passengerid,
            status: bookingstatus,
            reqforcurrgeolocn: userreqforcurrgeolocnvalue
        });

        var res = $http.post(Serviceurl + '/rideconfirmation', user, { headers: { 'Content-Type': 'application/json' } });
        try {
            res.success(function (data, status, headers, config) {
                $scope.notificationdata = "";
                $location.path('ownernotification.html');                
                $scope.iserror = true;
                $scope.success = true;
                document.getElementById("Loading").style.display = "none";
            }).error(function (data, status) {
                //alert(data);
                //$scope.iserror = false;
                //$scope.success = false;
                document.getElementById("Loading").style.display = "none";
                logdetails.userid = userId;
                logdetails.logdescription = status;
                Errorlog($http,$scope, logdetails, true);
            });
        } catch (e) {
            logdetails.userid = userId;
            logdetails.logdescription = e.message;
            Errorlog($http,$scope, logdetails, true);
        }
    }

});