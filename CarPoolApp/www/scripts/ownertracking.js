app.controller('ownertrackingCtrl', function ($scope, $http, $window, $location) {
    loadMapsApi();
    intilizecurrentownerlocation();
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

var myCenter;

function intilizecurrentownerlocation() {
    var userid = window.localStorage.getItem("userid");
    //var userid = "5029ce11-7535-6c69-4108-f5f0a1cd387a";
    localStorage.setItem("userid", userid);
    
    var address = "";
    var latitude = "";
    var longitude = "";

    //var ownerId = getUrlParameter('ownerId');
    var ownerId = window.localStorage.getItem("ownercartracking");
    window.localStorage.setItem("ownercartracking","");
    if (ownerId === undefined) {
        //getLocation();
    }
    else {
        try {
            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: "http://wiprocarpool.azurewebsites.net/getuserdetails/" + ownerId,
                dataType: "json",
                success: function (data) {
                    //currentRideObject = data[0];
                    address = data[0].currgeolocnaddress;
                    latitude = data[0].currgeolocnlat;
                    longitude = data[0].currgeolocnlong;
                    //myCenter = new google.maps.LatLng(latitude, longitude);
                    //myCenter = new google.maps.LatLng(51.508742, -0.120850);
                    //myCenter = new google.maps.LatLng(17.4479216, 78.377201);
                    myCenter = new google.maps.LatLng(latitude, longitude);


                    directionsService = new google.maps.DirectionsService();

                    directionsDisplay = new google.maps.DirectionsRenderer();

                    var mapProp = {
                        center: myCenter,
                        zoom: 15,
                        scrollwheel: true,
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
                        },
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    var map = new google.maps.Map(document.getElementById("map"), mapProp);
                    placeMarker(myCenter, map);


                    directionsDisplay.setMap(map);
                }, error: function (data, status) {
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
                logdescription: status
            }
            Errorlog($http,$scope, logdetails, true);
        }

    }

   
}

function placeMarker(myCenter, map) {
    var marker = new google.maps.Marker({
        position: myCenter,
        map: map,
    });
}
