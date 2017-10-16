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
            const eventMarker = this.markers[0].marker;
            const icon = eventMarker.getIcon();
            if (icon.startsWith('h_') == true) {
                return null
            } else {
                const h_icon = 'h_' + icon;
                eventMarker.setIcon(h_icon);
            };
        };
        this.defaultMarker = function(data) {
            const eventMarker = this.markers[0].marker;
            const icon = eventMarker.getIcon();
            if (icon.startsWith('h_') == false) {
                return null
            } else {
                const r_icon = icon.replace('h_','');
                eventMarker.setIcon(r_icon);
            };
        };

        // Center and Zoom on selected Emergency Event
        this.changeCenter = function(data) {
            //app.map.setCenter(data.location());
            //app.map.setZoom(17);
            var func = this;
            this.bounds = new google.maps.LatLngBounds();
            //Extend the boundaries of the map for each visible marker
            this.markers.forEach(function(marks){
                if (marks.marker.getVisible() == true) {
                    func.bounds.extend(marks.marker.position);
                    app.map.fitBounds(func.bounds);
                };
            });
        };

        // Sets Emergency Event to "all clear" and removes from active list
        this.allClear = function(data) {
            this.clear(true);
        };

        // Sets Emergency Event to "active" and adds it back to the active list
        this.stillHot = function(data) {
            this.clear(false);
        };

        /*
        Weather API Information
        */

        // Establish weather ko observables
        this.weatherMain = ko.observable();
        this.weatherTemp = ko.observable();
        this.weatherImg = ko.observable();
        this.weather = function() {
            // Open Weather Maps API call
            const api = "http://api.openweathermap.org/data/2.5/forecast?id=4508722&APPID=00b1eab8137a0b1d81025d667dbb2f17&units=imperial"
            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", api, false);
            xhttp.send(null);
            var results = JSON.parse(xhttp.responseText);

            // Store the values from the API results
            var weather_main = results.list[0].weather[0].main;
            var weather_desc = results['list'][0]['weather'][0]['description'];
            var weather_temp = results['list'][0]['main']['temp'];
            var weather_icon = results['list'][0]['weather'][0]['icon'];
            var weather_icon_img = 'http://openweathermap.org/img/w/' + weather_icon + '.png';

            // Push the weather values to the ko observables
            self.weatherMain(weather_main);
            self.weatherTemp(weather_temp);
            self.weatherImg(weather_icon_img);
        };
        // Initiate the weather function
        this.weather();

        /*
        Navigation Bar Function
        */

        // Switches between the sidebar 'tabs'
        var new_tab = document.getElementById('new_tab');
        var map_tab = document.getElementById('map_tab');
        new_tab.style.display = 'none';
        this.nav = function(z) {
            // Reset the flash messages on the new event page when you change tabs
            self.newEventMsg(false);
            self.errorForm(false);
            // Figure out which tab the user is clicking and make it visible while hiding the other
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
        this.responsiveNav = function () {
            var x = document.getElementById("navlist");
            if (x.className === "navList") {
                x.className += " responsive";
            } else {
                x.className = "navList";
            }
        };

        /* When the user clicks on the button,
        toggle between hiding and showing the dropdown content */
        this.showFilterList = function(x) {
            document.getElementById(x).classList.toggle("show");
        }

        // Resets the map to overview of Cincinnati
        this.reset = function() {
            //app.map.setCenter({lat: 39.106171, lng: -84.515712});
            //app.map.setZoom(10);
            var func = this;
            this.bounds = new google.maps.LatLngBounds();
            //Extend the boundaries of the map for each visible marker
            this.initialList().forEach(function(mark){
                mark.markers.forEach(function(marks){
                    if (marks.marker.getVisible() == true) {
                        func.bounds.extend(marks.marker.position);
                        app.map.fitBounds(func.bounds);
                    };
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
            if (selectedEvents.length == 0) {
                var x = ko.utils.arrayFilter(self.initialList(), function(item){
                    return item.clear() == self.clearEvents()
                });
                return x;
            } else {
                var x = ko.utils.arrayFilter(self.initialList(), function(item){
                    return ko.utils.arrayFilter(selectedEvents, function(p) {
                        return p.type == item.type() && item.clear() == self.clearEvents()
                    }).length > 0;
                });
                return x;
            };
        });

        // Create an array for hold the google event listeners
        this.zoomListeners = [];

        // Filter the markers based on the filtered list
        this.filteredMarkers = ko.computed(function(){
            // Get the filtered list
            this.filteredList = self.filteredList()
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
                };
                // Add google maps listener to change visiblity based on zoom level
                var zoomChange = google.maps.event.addListener(app.map, 'zoom_changed', function() {
                    var zoom = app.map.getZoom();
                    // If there is more than one marker set for the event, set those to show only when zoomed in
                    if (mark.markers.length > 1) {
                        for (i=1; i < mark.markers.length; i++) {
                            mark.markers[i].marker.setVisible(zoom >= 14);
                        };
                    };
                    // If there is a hotzone set for the event, set those to show only when zoomed in
                    if (mark.hotzones.length >0) {
                        for (i=0; i < mark.hotzones.length; i++) {
                            mark.hotzones[i].hotzone.setVisible(zoom >= 14);
                        };
                    };
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

        // Number Dropdown for New Emergency Event menu
        var $select = $(".numDropDownMenu");
        for (i=0;i<=500;i++){
            $select.append($('<option></option>').val(i).html(i))
        };

        // Create a new event
        this.newEvent = function(){
            if (self.tempLocMarker() == null){
                self.errorForm(true);
                self.newEventMsg(false);
            } else {
                // Counts current number of events in the list
                var event_num = self.initialList().length;
                this.id = event_num + 1;

                // Pull the data from the form input
                this.cas = document.getElementById("new_cas");
                this.cas_v = this.cas.options[this.cas.selectedIndex].value;
                this.rad = document.getElementById("new_rad");
                this.rad_v = this.rad.options[this.rad.selectedIndex].value;
                this.type = document.getElementById("new_type");
                this.type_v = this.type.options[this.type.selectedIndex].value;
                this.ppe = document.getElementById("new_ppe");
                this.ppe_v = this.ppe.options[this.ppe.selectedIndex].value;

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
                };
                for (var i = 0; i < self.tempAssemblyMarkersArray.length; i++) {
                  self.tempAssemblyMarkersArray[i].setMap(null);
                };
                for (var i = 0; i < self.tempComPostMarkersArray.length; i++) {
                  self.tempComPostMarkersArray[i].setMap(null);
                };
                for (var i = 0; i < self.tempDeconMarkersArray.length; i++) {
                  self.tempDeconMarkersArray[i].setMap(null);
                };
                for (var i = 0; i < self.tempHotzones.length; i++) {
                  self.tempHotzones[i].setMap(null);
                };
                self.tempLocMarkersArray = [];
                self.tempAssemblyMarkersArray = [];
                self.tempComPostMarkersArray = [];
                self.tempDeconMarkersArray = [];
                self.tempHotzones = [];

                // Reset the form
                this.type.selectedIndex = 0;
                this.ppe.selectedIndex = 0;
                this.cas.selectedIndex = 0;
                this.rad.selectedIndex = 0;
                self.errorForm(false);
                this.errorHotzonePreview(false);
            };
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
                        };
                    };
                    self.tempLocMarker(event.latLng);
                    self.tempLocMarkersArray.push(this.marker);
                };
                if (x == 'assembly') {
                    if (self.tempAssemblyMarkersArray.length > 0) {
                        for (var i = 0; i < self.tempAssemblyMarkersArray.length; i++) {
                          self.tempAssemblyMarkersArray[i].setMap(null);
                        };
                    };
                    self.tempAssemblyMarker(event.latLng);
                    self.tempAssemblyMarkersArray.push(this.marker);
                };
                if (x == 'com_post') {
                    if (self.tempComPostMarkersArray.length > 0) {
                        for (var i = 0; i < self.tempComPostMarkersArray.length; i++) {
                          self.tempComPostMarkersArray[i].setMap(null);
                        };
                    };
                    self.tempComPostMarker(event.latLng);
                    self.tempComPostMarkersArray.push(this.marker);
                };
                if (x == 'decon') {
                    if (self.tempDeconMarkersArray.length > 0) {
                        for (var i = 0; i < self.tempDeconMarkersArray.length; i++) {
                          self.tempDeconMarkersArray[i].setMap(null);
                        };
                    };
                    self.tempDeconMarker(event.latLng);
                    self.tempDeconMarkersArray.push(this.marker);
                };
                google.maps.event.removeListener(func.clicker);
            });
        };

        // Creats a temporary hotzone and captures lat-long data for later
        this.newHotzone = function(){
            if (self.tempLocMarker() == null) {
                this.errorHotzonePreview(true);
            } else {
                var func = this;
                // Remove previous Hotzone previews
                for (var i = 0; i < self.tempHotzones.length; i++) {
                  self.tempHotzones[i].setMap(null);
                };
                self.tempHotzones = [];
                // Establish radius and center
                var radius = parseFloat(document.getElementById('new_rad').value);
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
            };
        };

        /*
        Edit Event
        */

        this.showEditOptions = function(data) {
            var func = this;

            var zoom = app.map.getZoom();
            if (zoom <= 14) {
                this.bounds = new google.maps.LatLngBounds();
                //Extend the boundaries of the map for each visible marker
                func.markers.forEach(function(marks){
                    if (marks.marker.getVisible() == true) {
                        func.bounds.extend(marks.marker.position);
                        app.map.fitBounds(func.bounds);
                    };
                });
            };

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

            // Determine events ID nad convert to string
            var num = this.id();
            var n = num.toString();
            // Grab new selection elements
            this.e_id = document.getElementById(n);
            this.e_cas = this.e_id.getElementsByClassName("edit_cas");
            this.e_type = this.e_id.getElementsByClassName("edit_type");
            this.e_ppe = this.e_id.getElementsByClassName("edit_ppe");
            this.e_rad = this.e_id.getElementsByClassName("edit_rad");

            // Grab new data values
            this.e_v_type = this.e_type[0].value = this.type();
            this.e_v_ppe = this.e_ppe[0].value = this.ppe();
            this.e_v_rad = this.e_rad[0].selectedIndex = this.radius();
            this.e_v_cas = this.e_cas[0].selectedIndex = this.casualties();
        };

        this.cancelEditEvent = function(data){
            this.edit(false);
            // Make selected markers draggable
            data.markers.forEach(function(marks){
                marks.marker.setDraggable(false);
            });
            // Reset positions
            const positions = [
                {position: data.location()},
                {position: data.com_post()},
                {position: data.assembly()},
                {position: data.decon()}
                ];
            for (i=0; i<data.markers.length; i++) {
                data.markers[i].marker.setPosition(positions[i].position);
            }
            // Make old hotzone red
            data.hotzones.forEach(function(marks){
                marks.hotzone.setOptions({
                    fillColor: '#FF0000'
                });
            });
            // Reset temp hotzone
            for (var i = 0; i < self.tempHotzones.length; i++) {
              self.tempHotzones[i].setMap(null);
            };
            self.tempHotzones = [];
        };


        this.editEvent = function(data){
            var func = this;

            // Determine events ID nad convert to string
            var num = this.id();
            var n = num.toString();

            // Grab new Data
            this.e_id = document.getElementById(n);
            this.e_cas = this.e_id.getElementsByClassName("edit_cas");
            this.e_type = this.e_id.getElementsByClassName("edit_type");
            this.e_ppe = this.e_id.getElementsByClassName("edit_ppe");
            this.e_rad = this.e_id.getElementsByClassName("edit_rad");
            this.e_rad_loc = data.markers[0].marker.getPosition();

            // Grab new data values
            this.e_v_type = this.e_type[0].value;
            this.e_v_ppe = this.e_ppe[0].value;
            this.e_v_rad = this.e_rad[0].value;
            this.e_v_cas = this.e_cas[0].value;

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
            const e_type_reset = this.e_type[0].selectedIndex = 0;
            const e_ppe_reset = this.e_ppe[0].selectedIndex = 0;
            const e_cas_reset = this.e_cas[0].selectedIndex = 0;
            const e_rad_reset = this.e_rad[0].selectedIndex = 0;
            this.edit(false);

            // Reset temp hotzone
            for (var i = 0; i < self.tempHotzones.length; i++) {
              self.tempHotzones[i].setMap(null);
            };
            self.tempHotzones = [];
        };

        // Creats a temporary hotzone and captures lat-long data for later
        this.editHotzone = function(data){
            var func = this;

            // Determine events ID nad convert to string
            var num = this.id();
            var n = num.toString();
            // Remove previous Hotzone previews
            for (var i = 0; i < self.tempHotzones.length; i++) {
              self.tempHotzones[i].setMap(null);
            };
            self.tempHotzones = [];
            // Hide old hotzone
            data.hotzones.forEach(function(marks){
                marks.hotzone.setVisible(false);
            });
            // Establish radius and center
            this.e_id = document.getElementById(n);
            const radius = parseFloat(this.e_id.getElementsByClassName("edit_rad")[0].value);
            const center = data.markers[0].marker.getPosition();
            console.log(radius);
            console.log(center);
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