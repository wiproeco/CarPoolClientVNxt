
app.controller('ownerridesCtrl', function ($scope, $http, $window, Serviceurl, $location) {
    //$("#errormsg").hide();
    //$("#errordiv").hide();
    $scope.error = false;
    var logdetails = {
        userID: "",
        logdescription: "",
    }
    document.getElementById("Loading").style.display = "block";
    //navigationLinks($scope, $http, $window);
    $scope.IsError = false;

    $scope.rideId = "";
    $scope.rides = [];
    var userid = localStorage.getItem("userid");
    $scope.userName = localStorage.getItem("username");
    //var userid = "011251e3-a03d-60ad-a981-973b0bc60253";
    $scope.iserror = true;
    $scope.success = false;
    getAllRideDetails($scope, $http, userid, Serviceurl);
    $scope.cancel = function (rideId) {
        document.getElementById("Loading").style.display = "block";
        try {
            $http.post(Serviceurl + "/cancelride", { id: localStorage.getItem("userid"), rideid: rideId })
           .success(function (response) {
               getAllRideDetails($scope, $http, localStorage.getItem("userid"), Serviceurl);
               document.getElementById("Loading").style.display = "none";
               //alert(rideId + " has been cancelled");
               $scope.iserror = true;
               $scope.success = true;
           })
           .error(function (data, status) {
               document.getElementById("Loading").style.display = "none";
               //alert('failed');
               //$scope.iserror = false;
               //$scope.success = false;
               logdetails.userID = userid;
               logdetails.logdescription = status;
               Errorlog($http,$scope, logdetails, true);
           });
        }
        catch (e) {
            logdetails.userID = userid;
            logdetails.logdescription = e.message;
            Errorlog($http,$scope, logdetails);
        }
    }
    $scope.getDetails = function (rideId) {
        localStorage.setItem("currentRideId", rideId);        
        
        $location.path("/newride");
        //if (!$scope.$$phase) $scope.$apply();
        //window.location.href = "marker.html?rideid=" + rideId;
    }
    $scope.newRide = function () {
        window.location.href = "marker.html";
    }
});

function getAllRideDetails($scope, $http, userid, Serviceurl) {
    document.getElementById("Loading").style.display = "block";
    var currentdate = moment().format('MM-DD-YYYY');
    try {
        $http.get(Serviceurl + "/getallridedetails/" + userid + "/" + currentdate)

       // $http.get("http://localhost:1513/getallridedetails122/" + userid + "/" + currentdate)

        .success(function (response) {
            if (response.length > 0) {
                $scope.rides = response[0].rides;
            }
            document.getElementById("Loading").style.display = "none";

        })
        .error(function (data, status) {
            //alert('failed');
            document.getElementById("Loading").style.display = "none";
            var logdetails = {
                userid: localStorage.getItem("userid"),
                logdescription: status
            }
            Errorlog($http,$scope, logdetails, true);
        });
    } catch (e) {
        var logdetails = {
            userid: localStorage.getItem("userid"),
            logdescription: e.message
        }
        Errorlog($http,$scope, logdetails, true);
    }
}

app.controller('myRideDetailsCtrl', function ($scope, $http, $window, Serviceurl, $location) {
    $("#errormsg").hide();
    $("#errordiv").hide();
    $scope.IsError = false;
    var logdetails = {
        userID: "",
        logdescription: "",
    }
    //navigationLinks($scope, $http, $window);
    $scope.rideId = "";
    if (getUrlParameter('rideid') !== undefined) {
        $scope.rideId = getUrlParameter('rideid');
        var rideJSON = localStorage.getItem("currentRideObject");
        var rideObject = JSON.parse(rideJSON);
        $scope.seats = rideObject.seatsavailable;
        $scope.date.startdate = new Date(rideObject.startdatetime);
        $scope.date.enddate = new Date(rideObject.enddatetime);
    }
    $scope.date = {
        startdate: new Date(),
        enddate: new Date()
    }
    $scope.updateRide = function () {
        var rideJSON = localStorage.getItem("currentRideObject");
        var rideObject = JSON.parse(rideJSON);
        rideObject.seatsavailable = $scope.seats;
        //rideObject.startdatetime = "2015-12-24"; //JSON.parse(JSON.stringify($scope.date.startdate));
        // rideObject.enddatetime = "2015-12-24"; //JSON.parse(JSON.stringify($scope.date.enddate));

        rideObject.startdatetime = formatDate();
        rideObject.enddatetime = formatDate();
        //console.log(rideObject.startdatetime);
        $scope.iserror = true;
        $scope.success = false;
        //alert(JSON.stringify(rideObject));
        try {
            $http.post(Serviceurl + "/updateroute/", { userid: localStorage.getItem("userid"), ride: rideObject })
           .success(function (response) {
               //to update current location
               $http.post(Serviceurl + "/updatecarlocation/", {
                   userid: localStorage.getItem("userid"), currgeolocnaddress: rideObject.startpoint, currgeolocnlat: rideObject.startlat, currgeolocnlong: rideObject.startlng
               });
               /* $scope.rides = response[0].rides;  */
               $scope.iserror = true;
               $scope.success = true;
               $location.path("/ownerrides");
               //window.location.href = 'myrides.html';
           })
           .error(function (data, status) {
               //$scope.iserror = false;
               //$scope.success = false;
               //alert('failed');
               var userid = localStorage.getItem("userid");
               logdetails.userID = userid;
               logdetails.logdescription = status;
               Errorlog($http,$scope, logdetails, true);
           });
        }
        catch (e) {
            var userid = localStorage.getItem("userid");
            logdetails.userID = userid;
            logdetails.logdescription = e.message;
            Errorlog($http,$scope, logdetails, true);
        }
    }
});


function GetStartDate() {
    return (new Date()).toString();
}
function GetEndDate() {
    return (new Date()).toString();

}
function formatDate() {
    var d = new Date(),
        month = '-' + (d.getMonth() + 1),
        day = '-' + d.getDate(),
        year = d.getFullYear();

    var strDate = year + month + day;

    //2015-12-24

    return strDate;
}

