var app = app || {};

(function() {
    'use strict';
    app.initMap = function() {
        var map;
        // Constructor creates a new map - zoom and center are provied in 
        // ViewModel once markers have been applied
        app.map = new google.maps.Map(document.getElementById('map'), {
              mapTypeControl: false
        });

        ko.applyBindings(new app.ViewModel());
    };
})();