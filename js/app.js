var app = app || {};

(function() {
    'use strict';
    app.initMap = function() {
        var map;
        // Constructor creates a new map - zoom and center are provied in 
        // ViewModel once markers have been applied
        // Error Handling
        if (typeof google === 'object' && typeof google.maps === 'object') {
            app.map = new google.maps.Map(document.getElementById('map'), {
              mapTypeControl: false
            });
        } else {
            console.log('Google Maps failed to load');
            document.getElementById('map').innerHTML('<h1>Google Maps failed to load</h1>');            
        };
        
        ko.applyBindings(new app.ViewModel());
    };
})();