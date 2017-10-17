/*
Emergency Event Manager
Jonathan Prell
https://github.com/JTP709/Udacity_EMC
*/


var app = app || {};

(function() {
    app.ViewModel = function() {
        var self = this;

        /*
        Initial Setup and basic functions
        */

        // Create an observable array and populate with Emergency Events
        this.initialList = ko.observableArray([]);
        app.initialEmergency.forEach(function(item){
            self.initialList.push(new app.EventListing(item));
        });

        // Flash message hidden initially
        this.newEventMsg = ko.observable(false);
        this.errorForm = ko.observable(false);
        this.errorHotzonePreview = ko.observable(false);

        // Highlight a marker when hovering over list div element
        this.highlightMarker = function(data) {
            var eventMarker = data.markers[0].marker;
            var icon = eventMarker.getIcon();
            if (icon.startsWith('h_') === true) {
                return null;
            } else {
                var h_icon = 'h_' + icon;
                eventMarker.setIcon(h_icon);
            }
        };

        // Reset marker to default
        this.defaultMarker = function(data) {
            var eventMarker = data.markers[0].marker;
            var icon = eventMarker.getIcon();
            if (icon.startsWith('h_') === false) {
                return null;
            } else {
                var r_icon = icon.replace('h_','');
                eventMarker.setIcon(r_icon);
            }
        };

        // Center and Zoom on selected Emergency Event
        this.changeCenter = function(data) {
            var func = this;
            this.bounds = new google.maps.LatLngBounds();
            //Extend the boundaries of the map for each visible marker
            this.markers.forEach(function(marks){
                if (marks.marker.getVisible() === true) {
                    func.bounds.extend(marks.marker.position);
                    app.map.fitBounds(func.bounds);
                }
            });
        };

        // Sets Emergency Event to "all clear" and removes from active list
        this.allClear = function(data) {
            this.clear(true);
            self.defaultMarker(data);
        };

        // Sets Emergency Event to "active" and adds it back to the active list
        this.stillHot = function(data) {
            this.clear(false);
            self.defaultMarker(data);
        };

        /*
        Navigation Bar Function
        */

        // Switches between the sidebar 'tabs'
        this.new_tab = ko.observable(false);
        this.map_tab = ko.observable(true);
        this.nav = function(z) {
            // Reset the flash messages on the new event page when you change tabs
            self.newEventMsg(false);
            self.errorForm(false);
            // Figure out which tab the user is clicking and make it visible while hiding the other
            if (z === 'new_tab') {
                self.new_tab(true);
                self.map_tab(false);
                // Reset the form
                self.errorForm(false);
                this.errorHotzonePreview(false);
                self.casualtiesValue(0);
                self.radiusValue(0);
                self.typeValue('HAZMAT');
                self.ppeValue('LEVEL A');
                // Close edit options for other cards if opened
                self.initialList().forEach(function(data){
                    data.edit(false);
                });
            }
            if (z === 'map_tab') {
                self.new_tab(false);
                self.map_tab(true);
            }
        };

        // Toggle drop down menus
        this.checkbox_list = ko.observable(false);
        this.navlist = ko.observable(false);
        this.showFilterList = function(list) {
            if(list === 'checkbox_list' && self.checkbox_list() === false) {
                self.checkbox_list(true);
            } else {
                self.checkbox_list(false);
            }
            if (list === 'navlist' && self.navlist() === false) {
                self.navlist(true);
            } else {
                self.navlist(false);
            }
        };

        // Resets the map to overview of Cincinnati
        this.reset = function() {
            //app.map.setCenter({lat: 39.106171, lng: -84.515712});
            //app.map.setZoom(10);
            var func = this;
            this.bounds = new google.maps.LatLngBounds();
            //Extend the boundaries of the map for each visible marker
            this.initialList().forEach(function(mark){
                mark.markers.forEach(function(marks){
                    if (marks.marker.getVisible() === true) {
                        func.bounds.extend(marks.marker.position);
                        app.map.fitBounds(func.bounds);
                    }
                });
            });
        };

        /*
        Filter Function
        */

        // Build the filter list
        this.filters = [];
        app.typeList.forEach(function(item){
            self.filters.push(new app.typeFilter(item));
        });

        // Variable to check if old events are filtered; false indicates unchecked/unselected
        this.clearEvents = ko.observable(false);

        // Fliter the list based on filter check boxes
        this.filteredList = ko.computed(function(){
            var selectedEvents = ko.utils.arrayFilter(self.filters, function(p){
                return p.selected();
            });
            // Set all markers to invisible
            self.initialList().forEach(function(mark){
                mark.markers.forEach(function(marks){
                    marks.marker.setVisible(false);
                });
                mark.hotzones.forEach(function(marks){
                    marks.hotzone.setVisible(false);
                });
            });
            // Return the entire list of no checkboxes are checked
            if (selectedEvents.length === 0) {
                var x = ko.utils.arrayFilter(self.initialList(), function(item){
                    return item.clear() == self.clearEvents();
                });
                return x;
            } else {
                var y = ko.utils.arrayFilter(self.initialList(), function(item){
                    return ko.utils.arrayFilter(selectedEvents, function(p) {
                        return p.type == item.type() && item.clear() == self.clearEvents();
                    }).length > 0;
                });
                return y;
            }
        });

        // Create an array for hold the google event listeners
        this.zoomListeners = [];

        // Filter the markers based on the filtered list
        this.filteredMarkers = ko.computed(function(){
            // Get the filtered list
            this.filteredList = self.filteredList();
            // Remove google listener for zoom
            self.zoomListeners.forEach(function(mark){
                google.maps.event.removeListener(mark);
            });
            // Set only the filtered markers to visible
            this.filteredList.forEach(function(mark){
                var zoom = app.map.getZoom();
                if (zoom >= 14) {
                    // Set all markers to visible if zoomed in
                    mark.markers.forEach(function(marks){
                        marks.marker.setVisible(true);
                    });
                    mark.hotzones.forEach(function(marks){
                        marks.hotzone.setVisible(true);
                    });
                } else {
                    // Only set even marker to visible if zoomed out
                    mark.markers[0].marker.setVisible(true);
                }
                // Add google maps listener to change visiblity based on zoom level
                var zoomChange = google.maps.event.addListener(app.map, 'zoom_changed', function() {
                    var zoom = app.map.getZoom();
                    // If there is more than one marker set for the event, set those to show only when zoomed in
                    if (mark.markers.length > 1) {
                        for (var i=1; i < mark.markers.length; i++) {
                            mark.markers[i].marker.setVisible(zoom >= 14);
                        }
                    }
                    // If there is a hotzone set for the event, set those to show only when zoomed in
                    if (mark.hotzones.length >0) {
                        for (var j=0; j < mark.hotzones.length; j++) {
                            mark.hotzones[j].hotzone.setVisible(zoom >= 14);
                        }
                    }
                });
                self.zoomListeners.push(zoomChange);
            });
        });

        /*
        Create a new Emergency Event
        */

        // Set observables for marker lat-long data
        this.tempLocMarker = ko.observable(null);
        this.tempAssemblyMarker = ko.observable(null);
        this.tempComPostMarker = ko.observable(null);
        this.tempDeconMarker = ko.observable(null);

        // Set empty arrays for temp markers and temp hotzones
        this.tempLocMarkersArray = [];
        this.tempAssemblyMarkersArray = [];
        this.tempComPostMarkersArray = [];
        this.tempDeconMarkersArray = [];
        this.tempHotzones = [];

        // Number Dropdown for Radius and Casualties
        this.dropDownNumbers = ko.observableArray([]);
        for (var i = 0; i <= 500; i++){
            this.dropDownNumbers.push(i.toString());
        }

        // Drop down values - for use in create and edit functions
        this.casualtiesValue = ko.observable();
        this.radiusValue = ko.observable();
        this.ppeValue = ko.observable();
        this.typeValue = ko.observable();

        // Create a new event function
        this.newEvent = function(){
            if (self.tempLocMarker() === null){
                self.errorForm(true);
                self.newEventMsg(false);
            } else {
                // Counts current number of events in the list
                var event_num = self.initialList().length;
                this.id = event_num + 1;

                // Pull the data from the form input
                this.cas_v = self.casualtiesValue();
                this.rad_v = self.radiusValue();
                this.type_v = self.typeValue();
                this.ppe_v = self.ppeValue();

                // Pull the marker data
                this.location = self.tempLocMarker();
                this.assembly = self.tempAssemblyMarker();
                this.com_post = self.tempComPostMarker();
                this.decon = self.tempDeconMarker();

                // Populate a new array with the data
                this.newData = [
                    {
                        id: this.id,
                        location: this.location,
                        casualties: this.cas_v,
                        type: this.type_v,
                        ppe: this.ppe_v,
                        assembly: this.assembly,
                        com_post: this.com_post,
                        decon: this.decon,
                        radius: this.rad_v,
                        clear: false,
                        edit: false
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
                for (var i = 0; i < self.tempLocMarkersArray.length; i++) {
                  self.tempLocMarkersArray[i].setMap(null);
                }
                for (var j = 0; j < self.tempAssemblyMarkersArray.length; j++) {
                  self.tempAssemblyMarkersArray[j].setMap(null);
                }
                for (var k = 0; k < self.tempComPostMarkersArray.length; k++) {
                  self.tempComPostMarkersArray[k].setMap(null);
                }
                for (var l = 0; l < self.tempDeconMarkersArray.length; l++) {
                  self.tempDeconMarkersArray[l].setMap(null);
                }
                for (var m = 0; m < self.tempHotzones.length; m++) {
                  self.tempHotzones[m].setMap(null);
                }
                self.tempLocMarkersArray = [];
                self.tempAssemblyMarkersArray = [];
                self.tempComPostMarkersArray = [];
                self.tempDeconMarkersArray = [];
                self.tempHotzones = [];

                // Reset the form
                self.errorForm(false);
                this.errorHotzonePreview(false);
                self.casualtiesValue(0);
                self.radiusValue(0);
                self.typeValue('HAZMAT');
                self.ppeValue('LEVEL A');
            }
        };

        // Creats a temporary marker and captures lat-long data for later
        this.newTempMarker = function(x){
            var func = this;
            this.clicker = google.maps.event.addListener(app.map,'click', function(event){
                this.marker = new google.maps.Marker({
                    position: event.latLng,
                    map: app.map
                });
                if (x == 'location') {
                    if (self.tempLocMarkersArray.length > 0) {
                        for (var i = 0; i < self.tempLocMarkersArray.length; i++) {
                          self.tempLocMarkersArray[i].setMap(null);
                        }
                    }
                    self.tempLocMarker(event.latLng);
                    self.tempLocMarkersArray.push(this.marker);
                }
                if (x == 'assembly') {
                    if (self.tempAssemblyMarkersArray.length > 0) {
                        for (var j = 0; j < self.tempAssemblyMarkersArray.length; j++) {
                          self.tempAssemblyMarkersArray[j].setMap(null);
                        }
                    }
                    self.tempAssemblyMarker(event.latLng);
                    self.tempAssemblyMarkersArray.push(this.marker);
                }
                if (x == 'com_post') {
                    if (self.tempComPostMarkersArray.length > 0) {
                        for (var k = 0; k < self.tempComPostMarkersArray.length; k++) {
                          self.tempComPostMarkersArray[k].setMap(null);
                        }
                    }
                    self.tempComPostMarker(event.latLng);
                    self.tempComPostMarkersArray.push(this.marker);
                }
                if (x == 'decon') {
                    if (self.tempDeconMarkersArray.length > 0) {
                        for (var l = 0; l < self.tempDeconMarkersArray.length; l++) {
                          self.tempDeconMarkersArray[l].setMap(null);
                        }
                    }
                    self.tempDeconMarker(event.latLng);
                    self.tempDeconMarkersArray.push(this.marker);
                }
                google.maps.event.removeListener(func.clicker);
            });
        };

        // Creats a temporary hotzone and captures lat-long data for later
        this.newHotzone = function(){
            if (self.tempLocMarker() === null) {
                this.errorHotzonePreview(true);
            } else {
                // Remove previous Hotzone previews
                for (var i = 0; i < self.tempHotzones.length; i++) {
                  self.tempHotzones[i].setMap(null);
                }
                self.tempHotzones = [];
                // Establish radius and center
                var radius = parseFloat(self.radiusValue());
                var center = self.tempLocMarker();
                // Create the new hotzone preview
                this.hotzone = new google.maps.Circle({
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.4,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.075,
                    map: app.map,
                    center: center,
                    radius: radius
                });
                // Push the temp hotzone to the array
                self.tempHotzones.push(this.hotzone);
                // Remove the error message
                self.errorHotzonePreview(false);
            }
        };

        /*
        Edit Event
        */

        // Substitues card information with edit options
        this.showEditOptions = function(data) {
            var func = this;

            // Close edit options for other cards if opened
            self.initialList().forEach(function(data){
                    data.edit(false);
            });

            // Fit event markers into window
            this.bounds = new google.maps.LatLngBounds();
            //Extend the boundaries of the map for each visible marker
            func.markers.forEach(function(marks){
                if (marks.marker.getVisible() === true) {
                    func.bounds.extend(marks.marker.position);
                    app.map.fitBounds(func.bounds);
                }
            });

            this.edit(true);
            // Make selected markers draggable and not animated
            data.markers.forEach(function(marks){
                marks.marker.setDraggable(true);
                google.maps.event.clearListeners(marks.marker, 'mouseover');
                google.maps.event.clearListeners(marks.marker, 'mouseout');
            });
            // Make old hotzone grey
            data.hotzones.forEach(function(marks){
                marks.hotzone.setOptions({
                    fillColor: '#8e8e8e'
                });
            });

            // Grab new data values
            self.typeValue(this.type());
            self.ppeValue(this.ppe());
            self.radiusValue(this.radius());
            self.casualtiesValue(this.casualties());
        };

        // Cancels an edit and resets the information to original data
        this.cancelEditEvent = function(data){
            this.edit(false);
            // Make selected markers draggable
            data.markers.forEach(function(marks){
                marks.marker.setDraggable(false);
            });
            // Reset positions
            var positions = [
                {position: data.location()},
                {position: data.com_post()},
                {position: data.assembly()},
                {position: data.decon()}
                ];
            for (var i=0; i<data.markers.length; i++) {
                data.markers[i].marker.setPosition(positions[i].position);
            }
            // Make old hotzone red
            data.hotzones.forEach(function(marks){
                marks.hotzone.setOptions({
                    fillColor: '#FF0000'
                });
            });
            // Reset temp hotzone
            for (var j = 0; j < self.tempHotzones.length; j++) {
              self.tempHotzones[j].setMap(null);
            }
            self.tempHotzones = [];
            self.casualtiesValue(0);
            self.radiusValue(0);
            self.typeValue('HAZMAT');
            self.ppeValue('LEVEL A');
        };

        // Submit the temp edit data to the model and reset the form
        this.editEvent = function(data){
            var func = this;

            // Grab new data values
            this.e_v_type = self.typeValue();
            this.e_v_ppe = self.ppeValue();
            this.e_v_rad = self.radiusValue();
            this.e_v_cas = self.casualtiesValue();
            this.e_rad_loc = data.markers[0].marker.getPosition();

            // Update the event with the new data
            this.casualties(this.e_v_cas);
            this.type(this.e_v_type);
            this.ppe(this.e_v_ppe);
            this.radius(this.e_v_rad);

            // Update the hotzone location and reset color
            data.hotzones.forEach(function(marks){
                marks.hotzone.setOptions({
                    center: func.e_rad_loc,
                    strokeColor: '#FF0000',
                    fillColor: '#FF0000',
                    radius: parseFloat(func.e_v_rad),
                    visible: true
                });
            });

            // Turn off draggable markers
            data.markers.forEach(function(marks){
                marks.marker.setDraggable(false);
            });

            // Reset the form
            this.edit(false);
            self.casualtiesValue(0);
            self.radiusValue(0);
            self.typeValue('HAZMAT');
            self.ppeValue('LEVEL A');

            // Reset temp hotzone
            for (var i = 0; i < self.tempHotzones.length; i++) {
              self.tempHotzones[i].setMap(null);
            }
            self.tempHotzones = [];
        };

        // Creats a temporary hotzone and captures lat-long data for later
        this.editHotzone = function(data){
            // Remove previous Hotzone previews
            for (var i = 0; i < self.tempHotzones.length; i++) {
              self.tempHotzones[i].setMap(null);
            }
            self.tempHotzones = [];
            // Hide old hotzone
            data.hotzones.forEach(function(marks){
                marks.hotzone.setVisible(false);
            });
            // Establish radius and center
            var radius = parseFloat(self.radiusValue());
            var center = data.markers[0].marker.getPosition();
            // Create the new hotzone preview
            this.hotzone = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.4,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.075,
                map: app.map,
                center: center,
                radius: radius
            });
            // Push the temp hotzone to the array
            self.tempHotzones.push(this.hotzone);
        };

        // Reset Map after markers have been placed
        this.reset();
    };
})();