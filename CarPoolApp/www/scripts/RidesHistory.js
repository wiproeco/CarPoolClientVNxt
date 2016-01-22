app.controller('ridesHistoryCtrl', function ($scope, $http, $window, $filter, Serviceurl, $rootScope) {    
    $scope.processing = true;
    $scope.IsError = false;
    var logdetails = {
        userid: '',
        logdescription:''
    }
    var isowner;
    var id = window.localStorage.getItem("userid");
    $scope.userName = localStorage.getItem("username");
    var d = new Date();
    var currenttime = d.getTime();

    if ($rootScope.loginAsOwnerOrNot === "true") {
        isowner = true;
        $scope.ridehistoryas = "As a Owner"
    } else {
        isowner = false;
        $scope.ridehistoryas = "As a User"
    }    
    try {
        $http.get(Serviceurl + "/getrideshistory/" + id + "/" + isowner + "/" + currenttime)
            .success(function (response) {
                if (response.rides.length > 0) {
                    var ridesHistory = { rides: [] };
                    for (var i = 0; i < response.rides.length; i++) {
                        var date = new Date(response.rides[i].EndDate);
                        var rideDateTime = date.toDateString() + " " + addZero(date.getHours()) + ":" + addZero(date.getMinutes()) + ":" + addZero(date.getSeconds());
                        ridesHistory.rides.push({ "EndDate": rideDateTime, "StartPoint": response.rides[i].StartPoint, "EndPoint": response.rides[i].EndPoint });
                    }
                    $scope.ridesavailable = true;
                }
                else {
                    var ridesHistory = "no rides";
                    $scope.ridesavailable = false;
                }
                $scope.processing = false;
                $scope.rides = ridesHistory;
            }).error(function (data, status) {
                $scope.authenticated = true;
                document.getElementById("Loading").style.display = "none";
                logdetails.userid = $scope.txtEmail;
                logdetails.logdescription = status;
                Errorlog($http,$scope, logdetails, true);

            });
    } catch (e) {
        logdetails.userid = $scope.txtEmail;
        logdetails.logdescription = e.message;
        Errorlog($http,$scope, logdetails, true);
    }
    function addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }
});
