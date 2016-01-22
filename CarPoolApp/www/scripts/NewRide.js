var IsalreadyLoad = false;

app.controller('newRideCtrl', function ($scope, $http, $window, $location) {
    $("#errormsg").hide();
    $("#errordiv").hide();
    loadMapsApi();
    $scope.IsError = false;
    $("#btnRoute").click(function () {

        var mode = google.maps.DirectionsTravelMode.DRIVING;
        var request = {
            origin: geoLocation,
            destination: endLocation,
            waypoints: waypoints,
            travelMode: mode,
            optimizeWaypoints: true,
            avoidHighways: false
        };

        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                clearMarkers();
                directionsDisplay.setDirections(response);
            }
        });

    });
    $("#btnReset").click(function () {
        clearMarkers();
        clearWaypoints();
        directionsDisplay.setMap(null);
        directionsDisplay.setPanel(null);
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(map);
        addMarker(geoLocation, map);
        addMarker(endLocation, map);
    });
    $("#btnSubmit").click(function () {

        $(detailedWayPoints).each(function (index, waypoint) {            
            waypoint.boardingid = index + 1;
        });
       
        ride.startlat = geoLocation.lat();
        ride.startlng = geoLocation.lng();
        ride.endlat = endLocation.lat();
        ride.endlng = endLocation.lng();
        ride.boardingpoints = detailedWayPoints;

        if (rideId === undefined) {
            ride.startpoint = geoLocationName;
            ride.endpoint = $("#txtDestination").val();
        }
        else {
            ride.rideid = currentRideObject.rideid;
            ride.startpoint = currentRideObject.startpoint;
            ride.endpoint = currentRideObject.endpoint;
        }

        localStorage.setItem("currentRideObject", JSON.stringify(ride));

        try {
            if (rideId === undefined) {
                $location.path('/ridedetails');
                if (!$scope.$$phase) $scope.$apply();
            }
            else {
                // $location.path("ridedetails.html?rideid=" + currentRideObject.rideid);                
                $location.path("/ridedetails?rideid=" + currentRideObject.rideid);
                if (!$scope.$$phase) $scope.$apply();
            }
        } catch (e) {
            var logdetails = {
                userid: localStorage.getItem("userid"),
                logdescription: e.message
            }
            Errorlog($http, logdetails, true);
        }
    });
});


var markers = [];
var waypoints = [];
var detailedWayPoints = [];
var geoLat = 17.4258143;
var geoLong = 78.34054739999999;
var geoLocationName = null;
var map;
var endLocation;
var startLocation;
var geoLocation;
var directionsDisplay;
var directionsService;
var rideId = null;
var currentRideObject = null;
var ride = {
    rideid: null,
    startpoint: null,
    startlat: null,
    startlng: null,
    endpoint: null,
    endlat: null,
    endlng: null,
    startdatetime: null,
    enddatetime: null,
    seatsavailable: null,
    ridestatus: "open",
    isfavouiteride: true,
    boardingpoints: [],
    passengers: []
};

function intilize() {

    var isOwner = window.localStorage.getItem("isowner");
    if (isOwner == "true") {
        var userid = window.localStorage.getItem("userid");
        //var userid = "011251e3-a03d-60ad-a981-973b0bc60253";
        localStorage.setItem("userid", userid);

        rideId = getUrlParameter('rideid');
        if (rideId === undefined) {
            getLocation();
        }
        else {
            try {
                $.ajax({
                    type: "GET",
                    contentType: "application/json",
                    url: "http://wiprocarpool.azurewebsites.net/getridedetails/" + userid + "/" + rideId,
                    //url: "http://carpooltestapp.azurewebsites.net/updateroute",                
                    dataType: "json",
                    success: function (data) {
                        currentRideObject = data[0];
                        getLocationByRideId(data[0]);
                    },
                    error: function (data, status) {
                        var logdetails = {
                            userid: localStorage.getItem("userid"),
                            logdescription: status
                        }
                        Errorlog($http,$scope, logdetails, true);
                    }
                });
            }
            catch (e) {
                var logdetails = {
                    userid: localStorage.getItem("userid"),
                    logdescription: e.message
                }
                Errorlog($http,$scope, logdetails, true);
            }
        }

        directionsService = new google.maps.DirectionsService();


        var autocompleteStart = new google.maps.places.Autocomplete(document.getElementById("txtDestination"));



        google.maps.event.addListener(autocompleteStart, 'place_changed', function () {
            clearMarkers();
            clearWaypoints();
            var endPlace = autocompleteStart.getPlace();
            var Lat = endPlace.geometry.location.lat();
            var Long = endPlace.geometry.location.lng();
            endLocation = new google.maps.LatLng(Lat, Long);

            var latlngbounds = new google.maps.LatLngBounds();

            latlngbounds.extend(geoLocation);
            latlngbounds.extend(endLocation);

            map.setCenter(latlngbounds.getCenter());
            map.fitBounds(latlngbounds);

            google.maps.event.addListener(map, 'click', function (event) {
                var latLong = event.latLng;
                var geocoder = new google.maps.Geocoder;
                waypoints.push({ location: latLong, stopover: true });
                addMarker(latLong, map);
                geocoder.geocode({ 'location': latLong }, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results[1]) {
                            var addressObject = { boardingid: null, address: null, lat: null, lng: null };
                            addressObject.address = results[1].formatted_address;
                            addressObject.lat = latLong.lat();
                            addressObject.lng = latLong.lng();
                            detailedWayPoints.push(addressObject);
                        }
                    }
                });
            });
            addMarker(geoLocation, map);
            addMarker(endLocation, map);
        });
    }
}

function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

function clearWaypoints() {
    markers = [];
    waypoints = [];
    detailedWayPoints = [];
}


function getLocationByRideId(rideObject) {


    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    detailedWayPoints = rideObject.boardingpoints;

    geoLocation = new google.maps.LatLng(rideObject.startlat, rideObject.startlng);
    endLocation = new google.maps.LatLng(rideObject.endlat, rideObject.endlng);
    map = new google.maps.Map(document.getElementById('map'), {
        center: geoLocation,
        scrollwheel: true,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        draggableCursor: "pointer",
        mapTypeControl: false,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.VERTICAL_BAR,
            position: google.maps.ControlPosition.RIGHT_CENTER
        },
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        streetViewControl: false,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        }
    });
    directionsDisplay.setMap(map);

    var startLatLng = new google.maps.LatLng(rideObject.startlat, rideObject.startlng);
    var endLatLng = new google.maps.LatLng(rideObject.endlat, rideObject.endlng);

    $(rideObject.boardingpoints).each(function (index, object) {
        waypoints.push({ location: new google.maps.LatLng(object.lat, object.lng), stopover: true });
    });

    var mode = google.maps.DirectionsTravelMode.DRIVING;
    var request = {
        origin: startLatLng,
        destination: endLatLng,
        waypoints: waypoints,
        travelMode: mode,
        optimizeWaypoints: true,
        avoidHighways: false
    };

    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            clearMarkers();
            directionsDisplay.setDirections(response);
        }
    });
}



