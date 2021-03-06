﻿app.controller('usernotificationCtrl', function ($scope, $http, $window, $filter, Serviceurl, $location) {
    $("div.modal-backdrop").remove();
    $("#errormsg").hide();
    $("#errordiv").hide();
    $scope.IsError = false;
    var logdetails = {
        userid: "",
        logdescription: "",
    }
    document.getElementById("Loading").style.display = "block";
    //navigationLinks($scope, $http, $window);
    $scope.notificationdata = "";
    var userId = window.localStorage.getItem("userid");
    $scope.userName = localStorage.getItem("username");
    var currentdate = moment().format('MM-DD-YYYY');
    try {
        var url = Serviceurl + "/receivenotitifications/" + userId + "/" + currentdate;
        $http.get(url)
                .success(function (response) {

                    var data = JSON.stringify(response);
                    var result = JSON.parse(data);
                    if (result.length > 0) {
                        $scope.notificationdata = result;
                    }
                    document.getElementById("Loading").style.display = "none";

                }).error(function (data, status) {
                    document.getElementById("Loading").style.display = "none";
                    logdetails.userid = userId;
                    logdetails.logdescription = status;
                    Errorlog($http,$scope, logdetails, true);
                });
    } catch (e) {
        logdetails.userid = userId;
        logdetails.logdescription = e.message;
        Errorlog($http, $scope,logdetails, true);
    }

    $scope.trackownerlocation = function (ownerid) {
        //window.location.href = "tracking.html?ownerId=" + ownerid;
        window.localStorage.setItem("ownercartracking", ownerid);
        $location.path('/ownertracking');
    };
});