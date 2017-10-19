/*
Emergency Event Manager
Jonathan Prell
https://github.com/JTP709/Udacity_EMC
*/

/*
TODO: add google places API in addition to foursquare because that makes more sense
TODO: add database storage (Firebase)
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
        app.initialEvents.forEach(function(item){
            self.initialList.push(new app.EventListing(item));
        });
        app.list = this.initialList();
        console.log(app.list);

        this.isInfoWindowLoaded = ko.observable(false);
        google.maps.event.addListener(app.infoWindow, 'domready', function(){
            if (self.isInfoWindowLoaded() === false) {
                ko.applyBindings(self, document.getElementById('info_window_content'));
                self.isInfoWindowLoaded(true);
            }
        });



        /* Firebase code

        this.database.ref().once('value', function(snapshot){
            var request = snapshot.toJSON();
            console.log(request);
            console.log(request[0]);
            for (var i = 0; i < request.length; i++){
                self.initialList.push(new app.EventListing(request[i]));
            }

            app.initialEvents.forEach(function(item){
                self.initialList.push(new app.EventListing(item));
            });
        });
        */

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

        // Generate Hotzone Effect model from Info Window
        app.hotzoneEffectIW = function(data) {
            var idNum = data;
            var eventList = self.initialList();

            for (var i = 0; i < eventList.length; i++) {
                if (eventList[i].id() === idNum) {
                    self.hotzoneEffect(eventList[i]);
                }
            }
        };

        // Change Center option on Info Window
        app.changeCenterIW = function(data) {
            var idNum = data;
            var eventList = self.initialList();

            for (var i = 0; i < eventList.length; i++) {
                if (eventList[i].id() === idNum) {
                    self.changeCenter(eventList[i]);
                }
            }
        };

        // Change Center option on Info Window
        app.eventFilterIW = function(data) {
            var idNum = data;
            var eventList = self.initialList();

            for (var i = 0; i < eventList.length; i++) {
                if (eventList[i].id() === idNum) {
                    self.singleFilter(true);
                    self.showFilterDropMenu(false);
                    self.singleFilterID(eventList[i].id());
                }
            }
        };

        // Center and Zoom on selected Emergency Event
        this.changeCenter = function(data) {
            var func = this;
            this.bounds = new google.maps.LatLngBounds();
            //Extend the boundaries of the map for each visible marker
            data.markers.forEach(function(marks){
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

        // Generates a list of local businesses from Foursquare based on HOTZONE radus
        this.modal = ko.observable(false);
        this.localList = ko.observableArray([]);
        this.totalResults = ko.observable();
        self.resultsZero = ko.observable();
        this.resultsSwitch = ko.computed(function(){
            if (self.totalResults() === 0) {
                self.resultsZero(true);
                return false;
            } else {
                self.resultsZero(false);
                return true;
            }
        });
        this.foursquareError = ko.observable(false);
        this.hotzoneEffect = function (data) {
            var func = this;
            self.modal(true);
            self.localList([]);
            this.lat = function() {
                if (typeof data.location().lat === 'function') {
                    return data.location().lat();
                } else {
                    return data.location().lat;
                }
            };
            this.lng = function() {
                if (typeof data.location().lng === 'function') {
                    return data.location().lng();
                } else {
                    return data.location().lng;
                }
            };
            this.formatParams = function (params){
                return "?" + Object
                    .keys(params)
                    .map(function(key){
                      return key+"="+encodeURIComponent(params[key]);
                    })
                    .join("&");
            };
            this.localListing = function(data){
                this.name = ko.observable(data.name);
                this.address = ko.observable(data.address);
                this.phoneNum = ko.observable(data.phoneNum);
                this.hereNow_count = ko.observable(data.hereNow_count);
            };

            var lat = this.lat();
            var lng = this.lng();
            var rad;
            if (data.radius() <= 50) {
                rad = 50;
            } else {
                rad = data.radius();
            }

            var api = 'https://api.foursquare.com/v2/venues/explore';
            var params = {
                client_id: '5T4ZYC1CSKV2P24MBIXRW5DNRLQLMCU2CUCYAKCCUK0PXZXU',
                client_secret: 'F0JZXQ3AGUA0NTMFBJ5WA5YCHEAJKDJHTRG0QVQXQNKA5Y1K',
                ll: lat+','+lng,
                //query: 'coffee',
                v: '20170801',
                radius: rad,
                limit: 50
            };
            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", api + this.formatParams(params), true);
            xhttp.send(params);
            xhttp.addEventListener('load', function() {
                if(xhttp.status >= 200 && xhttp.status <400) {
                    var request = JSON.parse(xhttp.responseText);
                    // Reset error message
                    self.foursquareError(false);
                    // Store the values from the API results
                    self.totalResults(request.response.totalResults);
                    for (var i = 0; i < self.totalResults(); i++) {
                        var result = {
                            name: request.response.groups[0].items[i].venue.name,
                            address: request.response.groups[0].items[i].venue.location.address,
                            phoneNum: request.response.groups[0].items[i].venue.contact.formattedPhone,
                            hereNow_count: request.response.groups[0].items[i].venue.hereNow.count,
                        };
                        self.localList.push(new func.localListing(result));
                    }
                } else {
                    console.log('Error in network request ' + xhttp.statusText);
                    self.foursquareError(true);
                }
            });
            xhttp.onerror = function() {
                console.log('Error in network request ' + xhttp.statusText);
                self.foursquareError(true);
            };
        };

        // Close the modal
        this.closeModal = function() {
            self.modal(false);
        };
        // Close the modal if clicked on outsie of modal window
        window.onclick = function(event) {
            var modal = document.getElementById('myModal');
            if (event.target == modal) {
                self.modal(false);
            }
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
                self.resetForm();
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

        // Resets the map to overview of visible Event markers
        this.reset = function() {
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

        // Set all markers to invisible
        this.setMarkersOff = function() {
            self.initialList().forEach(function(mark){
                mark.markers.forEach(function(marks){
                    marks.marker.setVisible(false);
                });
                mark.hotzones.forEach(function(marks){
                    marks.hotzone.setVisible(false);
                });
            });
        };

        // Variable to check if old events are filtered; false indicates unchecked/unselected
        this.clearEvents = ko.observable(false);

        // Variable to check if a single event filter has been selected on the info Window
        this.singleFilter = ko.observable(false);
        this.singleFilterID = ko.observable();
        this.showFilterDropMenu = ko.observable(false);

        // Fliter the list based on filter check boxes
        this.filteredList = ko.computed(function(){
            if (self.singleFilter() === true) {
                // Set all markers to invisible
                self.setMarkersOff();
                var z = ko.utils.arrayFilter(self.initialList(), function(item){
                        return item.id() == self.singleFilterID();
                    });
                    return z;
            } else {
                var selectedEvents = ko.utils.arrayFilter(self.filters, function(p){
                    return p.selected();
                });
                // Reset single filter
                self.showFilterDropMenu(true);
                self.singleFilter(false);
                // Set all markers to invisible
                self.setMarkersOff();
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
            }
        });

        // Create an array for hold the google event listeners
        this.zoomListeners = [];

        // Filter the markers based on the filtered list
        this.filteredMarkers = ko.computed(function(){
            // Get the filtered list
            this.filteredList = self.filteredList();
            // Remove google listener for zoom and info Window
            self.zoomListeners.forEach(function(mark){
                google.maps.event.removeListener(mark);
            });
            // Set only the filtered markers to visible
            this.filteredList.forEach(function(mark){
                // Get map zoom level
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

        // Set empty arrays for temp markers and temp hotzones
        this.tempLocMarkersArray = ko.observableArray([]);
        this.tempAssemblyMarkersArray = ko.observableArray([]);
        this.tempComPostMarkersArray = ko.observableArray([]);
        this.tempDeconMarkersArray = ko.observableArray([]);
        this.tempMarkerArrays = ko.computed(function(){
            var tempArrays = [
                self.tempLocMarkersArray(),
                self.tempAssemblyMarkersArray(),
                self.tempComPostMarkersArray(),
                self.tempDeconMarkersArray()
            ];
            return tempArrays;

        });
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

        // Resets the create and edit form values
        this.resetForm = function() {
            self.casualtiesValue(0);
            self.radiusValue(0);
            self.typeValue('HAZMAT');
            self.ppeValue('LEVEL A');
        };

        // Change Event Icon Dynamicall while creating new event
        this.iconManager = ko.computed(function(){
            var icon = self.typeValue();
            if (self.tempLocMarkersArray()[0] !== undefined) {
                var img = 'icon/' + icon.replace(/\s+/g, "_") + '.png';
                self.tempLocMarkersArray()[0].setIcon(img);
            }
        });

        // Event button visibility Options
        this.locMarkButton = ko.observable(true);
        this.assemblyMarkButton = ko.observable(true);
        this.comMarkButton = ko.observable(true);
        this.decMarkButton = ko.observable(true);

        this.g_locMarkButton = ko.observable(false);
        this.g_assemblyMarkButton = ko.observable(false);
        this.g_comMarkButton = ko.observable(false);
        this.g_decMarkButton = ko.observable(false);

        this.markButtonSwitch = ko.computed(function() {
            if (self.locMarkButton() === true) {
                self.g_locMarkButton(false);
            } else {
                self.g_locMarkButton(true);
            }
            if (self.assemblyMarkButton() === true) {
                self.g_assemblyMarkButton(false);
            } else {
                self.g_assemblyMarkButton(true);
            }
            if (self.comMarkButton() === true) {
                self.g_comMarkButton(false);
            } else {
                self.g_comMarkButton(true);
            }
            if (self.decMarkButton() === true) {
                self.g_decMarkButton(false);
            } else {
                self.g_decMarkButton(true);
            }
        });

        this.markButtonReset = function() {
            var marker = self.tempMarkerArrays();
            if (marker[0][0] !== undefined) {
                self.locMarkButton(false);
            } else {
                self.locMarkButton(true);
            }
            if (marker[1][0] !== undefined) {
                self.assemblyMarkButton(false);
            } else {
                self.assemblyMarkButton(true);
            }
            if (marker[2][0] !== undefined) {
                self.comMarkButton(false);
            } else {
                self.comMarkButton(true);
            }
            if (marker[3][0] !== undefined) {
                self.decMarkButton(false);
            } else {
                self.decMarkButton(true);
            }
        };

        // Create a new event function
        this.newEvent = function(){
            if (self.tempMarkerArrays()[0].length === 0){
                self.errorForm(true);
                self.newEventMsg(false);
            } else {
                // Remove previous Hotzone previews
                for (var i = 0; i < self.tempHotzones.length; i++) {
                  self.tempHotzones[i].setMap(null);
                }
                self.tempHotzones = [];
                // Counts current number of events in the list
                var event_num = self.initialList().length;
                var id = event_num + 1;

                // Pull the data from the form input
                var cas_v = self.casualtiesValue();
                var rad_v = self.radiusValue();
                var type_v = self.typeValue();
                var ppe_v = self.ppeValue();

                var markerPos = function(i) {
                    var marker = self.tempMarkerArrays();
                    if (marker[i][0] !== undefined) {
                        return marker[i][0].position;
                    } else {
                        return null;
                    }
                };

                // Pull the marker data
                var location = markerPos(0);
                var assembly = markerPos(1);
                var com_post = markerPos(2);
                var decon = markerPos(3);

                // Populate a new array with the data
                this.newData = [
                    {
                        id: id,
                        location: location,
                        casualties: cas_v,
                        type: type_v,
                        ppe: ppe_v,
                        assembly: assembly,
                        com_post: com_post,
                        decon: decon,
                        radius: rad_v,
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

                self.tempMarkerArrays().forEach(function(mark) {
                    for (var i = 0; i < mark.length; i++) {
                        mark[i].setMap(null);
                    }
                });

                self.tempLocMarkersArray([]);
                self.tempAssemblyMarkersArray([]);
                self.tempComPostMarkersArray([]);
                self.tempDeconMarkersArray([]);
                self.tempHotzones = [];

                // Reset the form
                self.errorForm(false);
                this.errorHotzonePreview(false);
                self.resetForm();

                self.locMarkButton(true);
                self.assemblyMarkButton(true);
                self.comMarkButton(true);
                self.decMarkButton(true);
            }
        };

        // Creats a temporary marker and captures lat-long data for later
        this.newTempMarker = function(x){
            var func = this;

            self.locMarkButton(false);
            self.assemblyMarkButton(false);
            self.comMarkButton(false);
            self.decMarkButton(false);

            this.clicker = google.maps.event.addListener(app.map,'click', function(event){
                var markersArray;
                var icon;
                var pos = event.latLng;

                if (x == 'location') {
                    markersArray = self.tempLocMarkersArray();
                    icon = 'icon/' + self.typeValue().replace(/\s+/g, "_") + '.png';
                }
                if (x == 'assembly') {
                    markersArray = self.tempAssemblyMarkersArray();
                    icon = 'icon/assembly.png';
                }
                if (x == 'com_post') {
                    markersArray = self.tempComPostMarkersArray();
                    icon = 'icon/com_post.png';
                }
                if (x == 'decon') {
                    markersArray = self.tempDeconMarkersArray();
                    icon = 'icon/decon.png';
                }

                this.marker = new google.maps.Marker({
                    position: pos,
                    map: app.map,
                    icon: icon,
                    draggable: true
                });

                if (markersArray.length > 0) {
                    for (var i = 0; i < markersArray.length; i++) {
                      markersArray[i].setMap(null);
                    }
                }
                markersArray.push(this.marker);

                // Reset buttons
                self.markButtonReset();

                google.maps.event.removeListener(func.clicker);
            });
        };

        // Creats a temporary hotzone and captures lat-long data for later
        this.newHotzone = function(){
            if (self.tempMarkerArrays()[0].length === 0) {
                this.errorHotzonePreview(true);
            } else {
                // Remove previous Hotzone previews
                for (var i = 0; i < self.tempHotzones.length; i++) {
                  self.tempHotzones[i].setMap(null);
                }
                self.tempHotzones = [];
                // Establish radius and center
                var radius = parseFloat(self.radiusValue());
                var center = self.tempMarkerArrays()[0][0].position;
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

            // Change Event Icon Dynamicall while creating new event
            this.editIconManager = ko.computed(function(){
                var icon = self.typeValue();
                if (func.edit() === true) {
                    var img = 'icon/' + icon.replace(/\s+/g, "_") + '.png';
                    func.markers[0].marker.setIcon(img);
                }
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
            self.resetForm();
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

            for (var i = 0; i < data.markers.length; i++) {
                if (data.markers[i].marker.title === 'Command Post') {
                    this.com_post(data.markers[i].marker.position);
                }
                if (data.markers[i].marker.title === 'Assembly Point') {
                    this.assembly(data.markers[i].marker.position);
                }
                if (data.markers[i].marker.title === 'Decontamination Point') {
                    this.decon(data.markers[i].marker.position);
                }
            }

            // Update the event with the new data
            this.location(this.e_rad_loc);
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
            self.resetForm();

            // Reset temp hotzone
            for (var j = 0; j < self.tempHotzones.length; j++) {
              self.tempHotzones[j].setMap(null);
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