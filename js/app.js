var app = app || {};

(function() {
    'use strict';

    app.initMap = function() {
        // Map Tab
        var map;
        // Createa new blank array for all of the markers.
        var markers = [];
        // This global polygon variable is to ensure only ONE polygon is rendered.
        var polygon = null;

        var placeMarkers = [];
        // Constructor creates a new map - only center and zoom are required.
        app.map = new google.maps.Map(document.getElementById('map'), {
              center: {lat: 40.7413549, lng: -73.9980244},
              zoom: 13,
              mapTypeControl: false
        });

    ko.applyBindings(new app.ViewModel());
    
    };
})();