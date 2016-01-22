/// <reference path="angular.min.js" />


var Errorlog = function ($http, $scope, request, isrender) {
    var d = new Date();
    request = {
        userid: request.userid,
        logdescription: request.logdescription,
        logDate: d.toLocaleDateString(),
        logTime: d.toLocaleTimeString(),
        type: 'Diagnostic'
    }
    $http.post("http://wiprocarpool.azurewebsites.net/getLoghandler/", request)
            .success(function (res) {
                console.log(res);
                if (isrender == true) {
                    $("#errordiv").show();
                    $("#errormsg").show();
                    $("#errormsg").html("Oops something went wrong. Please try again or refresh the page");
                } else {
                    $scope.errormsg = true;
                    $scope.authenticated = false;
                    // $("#errormsg").html("Login failed 3 times. Contact adminstration");
                }
            });

}

