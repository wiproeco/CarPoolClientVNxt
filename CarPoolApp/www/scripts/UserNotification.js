app.controller('usernotificationCtrl', function ($scope, $http, $window, $filter, Serviceurl) {
    $("div.modal-backdrop").remove();
    $("#errormsg").hide();
    $("#errordiv").hide();
    var logdetails = {
        userid: "",
        logdescription: "",
        logDate: $filter('date')(new Date(), 'dd/MM/yyyy'),
        logTime: $filter('date')(new Date(), 'HH:mm'),
        type: 'Diagnostic'
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
                    Errorlog($http, logdetails, true);
                });
    } catch (e) {
        logdetails.userid = userId;
        logdetails.logdescription = e.message;
        Errorlog($http, logdetails, true);
    }

    $scope.trackownerlocation = function (ownerid) {
        window.location.href = "tracking.html?ownerId=" + ownerid;
    };
});