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
var serviceurl = "http://wiprocarpool.azurewebsites.net";
var isOwner = window.localStorage.getItem("isowner");

function intilize() {

    if (isOwner == "false") {
        getLocation();
    }
    else {
        getLocationforNewride();
    }
}

function getOwnerLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {

            directionsDisplay = new google.maps.DirectionsRenderer();
            var geocoder = new google.maps.Geocoder;

            geoLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            //geoLocation = new google.maps.LatLng(geoLat, geoLong);
            geocoder.geocode({ 'location': geoLocation }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        geoLocationName = results[1].formatted_address;
                    }
                }
            });
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


        },
        function (error) { alert("enable location in your mobile"); }, { timeout: 1000, enableHighAccuracy: true, maximumAge: 90000 });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function getLocationforNewride() {
    var userid = window.localStorage.getItem("userid");
    //var userid = "011251e3-a03d-60ad-a981-973b0bc60253";
    localStorage.setItem("userid", userid);

    rideId = getUrlParameter('rideid');
    if (rideId === undefined) {
        getOwnerLocation();
    }
    else {
        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: "http://wiprocarpool.azurewebsites.net/getridedetails/" + userid + "/" + rideId,
            //url: "http://carpooltestapp.azurewebsites.net/updateroute",                
            dataType: "json",
            success: function (data) {
                currentRideObject = data[0];
                getLocationByRideId(data[0]);
            }
        });

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

            addMarkerForNewride(latLong, map);
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
        addMarkerForNewride(geoLocation, map);
        addMarkerForNewride(endLocation, map);
    });
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

function addMarkerForNewride(latlng, map1) {
    markers.push(new google.maps.Marker({
        position: latlng,
        map: map1,
        icon: "http://maps.google.com/mapfiles/marker" + String.fromCharCode(markers.length + 65) + ".png"
    }));
}

function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}
