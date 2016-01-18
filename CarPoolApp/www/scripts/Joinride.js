app.controller('JoinrideCtrl', function ($scope, $http, $window, $location) {
    loadMapsApi();
    $("#errordiv").hide();
    $("errormsg").hide();
    $("#btnJoinRide").click(function () {

        var reqforcurrgeolocnvalue = "";

        if (document.getElementById("chkreqforcurrgeolocn").checked)
            reqforcurrgeolocnvalue = true;
        else
            reqforcurrgeolocnvalue = false;
        var cssid = $(".modal-backdrop fade in");
        cssid.removeClass('modal-backdrop');
        cssid.removeClass('fade in');
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
            }
        });
    });
});

function loadMapsApi() {
    var viewport = {
        width: $(window).width(),
        height: $(window).height()
    };

    $("#map").css("width", viewport.width);
    $("#map").css("height", viewport.height);
    //TODO: Add your own Google maps API key to the URL below.        
    $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyCZmYWHb3GXK-Z-yrmowHMJLfjfl-VytI0&sensor=true&libraries=places&callback=intilize');
};

var markers = [];
var waypoints = [];
var geoLat = 17.4258143;
var geoLong = 78.34054739999999;
var map;
var geoLocation;
var startLocation;
var service = {
    locations: [],
    pickuplocations: [],
    user: []
};
var nearVehicles = [];
var rideObject = null;
var carOwnerId = null;
var serviceurl = "http://carpoolwipro.azurewebsites.net";


function intilize() {

    getLocation();
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var directionsService = new google.maps.DirectionsService();
            var directionsDisplay = new google.maps.DirectionsRenderer();

            geoLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            //geoLocation = new google.maps.LatLng(geoLat, geoLong);
            var autocompleteStart = new google.maps.places.Autocomplete(document.getElementById("txtDestination"));

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

            var currentlocation = new google.maps.Marker({
                position: geoLocation,
                map: map,
            })

            google.maps.event.addListener(autocompleteStart, 'place_changed', function () {
                clearMarkers();
                var searchLocation = autocompleteStart.getPlace();
                $.ajax({
                    type: "GET",
                    contentType: "application/json",
                    url: serviceurl + "/searchrides/" + searchLocation.vicinity,
                    dataType: "json",
                    success: function (data) {
                        $(data).each(function (index, obj) {
                            var vehicleLatLng = new google.maps.LatLng(obj.lat, obj.lng);
                            var querystring = obj.id + "/" + obj.rideid;
                            addMarker(vehicleLatLng, map, querystring);
                        });
                        directionsDisplay.setMap(map);
                    }
                });
            });           

        }, function (error) { alert("enable location in your mobile"); }, { timeout: 1000, enableHighAccuracy: true, maximumAge: 90000 });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function addMarker(latlng, map1, docId) {
    var marker = new google.maps.Marker({
        position: latlng,
        map: map1
        //icon: "/images/car-image.png"
        //title: docId
    });
    marker.setTitle(docId);
    marker.addListener('click', function () {
        var position = marker.getPosition();
        var docId = marker.getTitle();
        carOwnerId = docId.split("/")[0];

        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: serviceurl + "/getridedetails/" + docId,
            dataType: "json",
            success: function (response) {

                $("#ddlPickuppoints").html("");
                var data = response[0];
                rideObject = response[0];
                $("#carmodal").modal("toggle");
                $("#carOwner").text(response[0].userName);
                $("#carNumber").text(response[0].carNo);
                $("#carSeatsCount").text(response[0].seatsavailable);
                $("#carFrom").text(response[0].startpoint);
                $("#carTo").text(response[0].endpoint);
                $(data.boardingpoints).each(function (index, obj) {
                    var option = $("<option></option>");
                    option.attr("value", obj.boardingid).text(obj.address);
                    $("#ddlPickuppoints").append(option);
                });
            }
        });

    });
    markers.push(marker);
}

function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}