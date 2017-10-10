var app = app || {};

(function() {
    app.ViewModel = function() {
        var self = this;

        // Navigation Bar Functions
        var new_tab = document.getElementById('new_tab');
        var map_tab = document.getElementById('map_tab');
        new_tab.style.display = 'none';
        this.nav = function(z) {
            self.newEventMsg(false);
            self.errorForm(false);
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
            // Return the entire list of no checkboxes are checked
            if (selectedEvents.length == 0) {
                self.initialList().forEach(function(mark){
                    mark.markers.forEach(function(mark){
                        mark.marker.setVisible(true);
                    });
                });
                return self.initialList();
            } else {
                var x = ko.utils.arrayFilter(self.initialList(), function(item){
                    return ko.utils.arrayFilter(selectedEvents, function(p) {
                        return p.type == item.type()
                    }).length > 0;
                });
                // Set all markers to invisible
                self.initialList().forEach(function(mark){
                    mark.markers.forEach(function(mark){
                        mark.marker.setVisible(false);
                    });
                });
                // set only the filtered markers to visible
                x.forEach(function(mark){
                    mark.markers.forEach(function(mark){
                        mark.marker.setVisible(true);
                    });
                });
                return x;
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

        // Create a new Emergency Event
        
        // Set observables for marker lat-long data
        this.tempLocMarker = ko.observable(null);
        this.tempAssemblyMarker = ko.observable(null);
        this.tempComPostMarker = ko.observable(null);
        this.tempDeconMarker = ko.observable(null);

        // Casualty Number Dropdown for New Emergency Event menu
        
        var $select = $("#new_cas");
        for (i=0;i<=100;i++){
            $select.append($('<option></option>').val(i).html(i))
        };

        // Flash message hidden initially
        this.newEventMsg = ko.observable(false);
        this.errorForm = ko.observable(false);

        this.newEvent = function(){
            // Check to make sure the form is filled out
            var typeCheck = document.querySelector('input[name = "type"]:checked');
            var ppeCheck = document.querySelector('input[name = "ppe"]:checked');
            /*
            var locCheck = self.tempLocMarker();
            || locCheck == null
            */
            if (typeCheck == null || ppeCheck == null){
                self.errorForm(true);
                self.newEventMsg(false);
            } else {
                // Counts current number of events in the list
                var event_num = self.initialList().length;

                this.id = event_num + 1;
                this.location = self.tempLocMarker();
                this.cas = document.getElementById("new_cas").value;
                this.type = document.querySelector('input[name = "type"]:checked').value;
                this.ppe = document.querySelector('input[name = "ppe"]:checked').value;
                this.assembly = self.tempAssemblyMarker();
                this.com_post = self.tempComPostMarker();
                this.decon = self.tempDeconMarker();
                // Populate a new array with the data
                this.newData = [
                    {
                        id: this.id,
                        location: this.location,
                        casualties: this.cas,
                        type: this.type,
                        ppe: this.ppe,
                        assembly: this.assembly,
                        com_post: this.com_post,
                        decon: this.decon
                    }
                ];

                // Add the data to our model
                this.newData.forEach(function(item){
                    self.initialList.push(new app.EventListing(item));
                });

                // Show the flash message indicating a new event was added
                self.newEventMsg(true);

                // Reset the temp marker observables and array
                this.tempLocMarker = ko.observable(null);
                this.tempAssemblyMarker = ko.observable(null);
                this.tempComPostMarker = ko.observable(null);
                this.tempDeconMarker = ko.observable(null);
                self.tempMarkers = ko.observableArray([]);

                // Reset the form
                this.cas_reset = document.getElementById("new_cas");
                this.type_reset = document.querySelector('input[name = "type"]:checked');
                this.ppe_reset = document.querySelector('input[name = "ppe"]:checked');
                this.type_reset.checked = false;
                this.ppe_reset.checked = false;
                this.cas_reset.selectedIndex = 0;
                self.errorForm(false);
            };
        };

        this.newLocationMarker = function(){
            app.map.addListener(app.map,'click', this.addTempMarker);
            self.listener = true;
            this.addTempMarker = function(event){
                placeMarker(event.latLng);
                self.tempLocMarker = ko.observable(event.latLng);
                console.log('Location Added');
                console.log(event.latLng);
            };
        };

        this.newAssemblyMarker = function(){
            app.map.addListener(app.map,'click', this.addTempMarker);
            this.addTempMarker = function(event){
                placeMarker(event.latLng);
                self.tempAssemblyMarker = ko.observable(event.latLng);
            };
        };

        this.newComPostMarker = function(){
            app.map.addListener(app.map,'click', this.addTempMarker);
            this.addTempMarker = function(event){
                placeMarker(event.latLng);
                self.tempComPostMarker = ko.observable(event.latLng);
            };
        };

        this.newDeconMarker = function(){
            app.map.addListener(app.map,'click', this.addTempMarker);
            this.addTempMarker = function(event){
                placeMarker(event.latLng);
                self.tempDeconMarker = ko.observable(event.latLng);
            };
        };

        this.tempMarkers = ko.observableArray([]);
        
        this.placeMarker = function(location) {
            this.marker = new google.maps.Marker({
                position: location,
                map: app.map
            });
            self.tempMarkers.push(this.marker);
        };
    };
})();