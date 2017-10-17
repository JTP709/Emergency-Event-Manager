/*
Emergency Event Manager
Jonathan Prell
https://github.com/JTP709/Udacity_EMC
*/

var app = app || {};

(function() {
    'use strict';

    app.googleError = function() {
        // Error Handling
        console.log('Google Maps failed to load');
        document.getElementById('error').style.display = 'flex';
    };

    app.initMap = function() {
        // Constructor creates a new map - zoom and center are provied in
        // ViewModel once markers have been applied
        if (typeof google === 'object' && typeof google.maps === 'object') {
            app.map = new google.maps.Map(document.getElementById('map'), {
              mapTypeControl: false
            });
        } else {
            // Error Handling
            app.googleError();
        }

        app.infoWindow = new google.maps.InfoWindow();

        ko.applyBindings(new app.ViewModel());
    };
})();