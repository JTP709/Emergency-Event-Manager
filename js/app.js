var app = app || {};

(function() {
    'use strict';
    app.initMap = function() {
        // Map Tab
        var map;
        
        // Constructor creates a new map - only center and zoom are required.
        app.map = new google.maps.Map(document.getElementById('map'), {
              center: {lat: 39.173853, lng: -84.507786},
              zoom: 14,
              mapTypeControl: false
        });
        ko.applyBindings(new app.ViewModel());
    };
})();