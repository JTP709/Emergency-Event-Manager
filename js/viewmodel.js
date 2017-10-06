var app = app || {};

(function() {
    app.ViewModel = function() {
        var self = this;

        // Navigation Bar Functions
        var new_tab = document.getElementById('new_tab');
        var map_tab = document.getElementById('map_tab');
        new_tab.style.display = 'none';
        this.nav = function() {
            var x = new_tab;
            var y = map_tab;
            if (x.style.display === 'none') {
                x.style.display = 'block';
                y.style.display = 'none';
            } else {
                x.style.display = 'none';
                y.style.display = 'block';
            };
        };

        // Create an observable array and populate with Emergency Events
        this.emergencyList = ko.observableArray([]);
        app.initialEmergency.forEach(function(item){
            self.emergencyList.push(new app.Model(item));
        });

        // Markers
        // Create a new blank array for all the listing markers.
        var markers = [];
        // This function takes in a COLOR, and then creates a new marker
        // icon of that color. The icon will be 21 px wide by 34 high, have an origin
        // of 0, 0 and be anchored at 10, 34).
        this.makeMarkerIcon = function(markerColor) {
            var markerImage = new google.maps.MarkerImage(
              'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
              '|40|_|%E2%80%A2',
              new google.maps.Size(21, 34),
              new google.maps.Point(0, 0),
              new google.maps.Point(10, 34),
              new google.maps.Size(21,34));
            return markerImage;
        };
        // Initialize the drawing manager.
        var drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: google.maps.drawing.OverlayType.POLYGON,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
            drawingModes: [
              google.maps.drawing.OverlayType.POLYGON
            ]
          }
        });
        // Style the markers a bit. This will be our listing marker icon.
        var defaultIcon = this.makeMarkerIcon('0091ff');
        // Create a "highlighted location" marker color for when the user
        // mouses over the marker.
        var highlightedIcon = this.makeMarkerIcon('FFFF24');
        // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < app.initialEmergency.length; i++) {
          // Get the position from the location array.
          var position = app.initialEmergency[i].location;
          var title = app.initialEmergency[i].type;
          // Create a marker per location, and put into markers array.
          var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
          });
          console.log(position);
          // Push the marker to our array of markers.
          markers.push(marker);
          // Create an onclick event to open the large infowindow at each marker.
          marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
          });
          // Two event listeners - one for mouseover, one for mouseout,
          // to change the colors back and forth.
          marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
          });
          marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
          });
        };
        // This function will loop through the markers array and display them all.
        this.showListings = function() {
            var bounds = new google.maps.LatLngBounds();
            // Extend the boundaries of the map for each marker and display the marker
            for (var i = 0; i < markers.length; i++) {
              markers[i].setMap(map);
              bounds.extend(markers[i].position);
            }
            map.fitBounds(bounds);
        };
        // Center and Zoom on selected Emergency Event
        this.changeCenter = function(data) {
            app.map.setCenter(data.location());
            app.map.setZoom(14);
        };

        // TODO create a form to input new emergency data and add to the array
    };
})();