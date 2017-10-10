var app = app || {};

(function() {
    'use strict';
    app.initMap = function() {
        // Map Tab
        var map;
        
        // Constructor creates a new map - only center and zoom are required.
        app.map = new google.maps.Map(document.getElementById('map'), {
              center: {lat: 39.106171, lng: -84.515712},
              zoom: 10,
              mapTypeControl: false
        });

        ko.applyBindings(new app.ViewModel());
    };
})();