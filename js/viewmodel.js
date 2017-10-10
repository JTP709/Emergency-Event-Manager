var app = app || {};

(function() {
    app.ViewModel = function() {
        var self = this;

        // Navigation Bar Functions
        var new_tab = document.getElementById('new_tab');
        var map_tab = document.getElementById('map_tab');
        new_tab.style.display = 'none';
        this.nav = function(z) {
            var x = new_tab;
            var y = map_tab;
            if (z === 'new_tab') {
                x.style.display = 'block';
                y.style.display = 'none';
            };
            if (z === 'map_tab') {
                x.style.display = 'none';
                y.style.display = 'block';
            };
        };

        // Create an observable array and populate with Emergency Events
        this.initialList = ko.observableArray([]);
        app.initialEmergency.forEach(function(item){
            self.initialList.push(new app.EventListing(item));
        });

        // Create an observable array and populate with Event Markers
        this.initialMarkers = ko.observableArray([]);
        app.initialEmergency.forEach(function(item){
            self.initialMarkers.push(new app.EventMarkers(item));
        });

        // Create an array of filters
        this.checkbox = function(x) {
            this.type = x;
            this.selected = ko.observable(false);
        };
        this.filters = [
            new this.checkbox('HAZMAT'),
            new this.checkbox('FIRE')
        ];

        
        // Fliter the list based on filter check boxes
        this.filteredList = ko.computed(function(){
            var selectedEvents = ko.utils.arrayFilter(self.filters, function(p){
                return p.selected();
            });
            if (selectedEvents.length == null) {
                return self.initialList();
            } else {
                return ko.utils.arrayFilter(self.initialList(), function(item){
                    return ko.utils.arrayFilter(selectedEvents, function(p) {
                        return p.type == item.type
                    }).length > 0;
                });
            };
        });
        
        // Center and Zoom on selected Emergency Event
        this.changeCenter = function(data) {
            app.map.setCenter(data.location());
            app.map.setZoom(17);
        };

        // Resets the map to overview of Cincinnati
        this.reset = function() {
            app.map.setCenter({lat: 39.106171, lng: -84.515712});
            app.map.setZoom(10);
        };

        // TODO create a form to input new emergency data and add to the array
    };
})();