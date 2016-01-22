app.controller('JoinrideCtrl', function ($scope, $http, $window, $location) {
    loadMapsApi();
    $("#errordiv").hide();
    $("errormsg").hide();
    $scope.IsError = false;
    $("#btnJoinRide").click(function () {

        var reqforcurrgeolocnvalue = "";

        if (document.getElementById("chkreqforcurrgeolocn").checked)
            reqforcurrgeolocnvalue = true;
        else
            reqforcurrgeolocnvalue = false;
        var cssid = $(".modal-backdrop fade in");
        cssid.removeClass('modal-backdrop');
        cssid.removeClass('fade in');
        try {
            $.ajax({
                type: "POST",
                contentType: "application/json",
                url: serviceurl + "/joinride/",
                data: JSON.stringify({ carownerId: carOwnerId, userId: localStorage.getItem("userid"), rideid: rideObject.rideid, boardingid: $("#ddlPickuppoints").val(), reqforcurrgeolocn: reqforcurrgeolocnvalue }),
                dataType: "json",
                success: function (data) {
                    $("#carmodal").hide();
                    $location.path("/usernotification");
                    if (!$scope.$$phase) $scope.$apply();
                },
                error: function () {
                    var logdetails = {
                        userid: localStorage.getItem("userid"),
                        logdescription: status
                    }
                    Errorlog($http,$scope, logdetails, true);
                }
            });
        } catch (e) {
            var logdetails = {
                userid: localStorage.getItem("userid"),
                logdescription: e.message
            }
            Errorlog($http, $scope,logdetails, true);
        }
    });
});

