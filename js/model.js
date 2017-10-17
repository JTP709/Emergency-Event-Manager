// Maps Icons Collection https://mapicons.mapsmarker.com

var app = app || {};

(function(){
    app.initialEmergency = [
        {
            id: 1,
            location: {lat: 39.173853, lng: -84.507786},
            casualties: 4,
            type: 'HAZMAT',
            ppe: 'LEVEL A',
            assembly: {lat: 39.176411, lng: -84.507937},
            com_post: {lat: 39.175396, lng: -84.507062},
            decon: {lat: 39.174987, lng: -84.507533},
            radius: 50,
            clear: false,
            edit: false
        },
        {
            id: 2,
            location: {lat: 39.087383, lng: -84.725753},
            casualties: 0,
            type: 'FIRE',
            ppe: 'Turnout',
            assembly: {lat: 39.085401, lng: -84.725157},
            com_post: {lat: 39.086947, lng: -84.727718},
            decon: null,
            radius: 50,
            clear: false,
            edit: false
        },
        {
            id: 3,
            location: {lat: 38.993431, lng: -84.647401},
            casualties: 2,
            type: 'FIRE',
            ppe: 'Turnout',
            assembly: {lat: 38.993168, lng: -84.650226},
            com_post: {lat: 38.992819, lng: -84.649519},
            decon: null,
            radius: 55,
            clear: false,
            edit: false
        },
        {
            id: 4,
            location: {lat: 39.114720, lng: -84.528539},
            casualties: 2,
            type: 'CONFINED SPACE RESCUE',
            ppe: 'LEVEL B',
            assembly: {lat: 39.112839, lng: -84.526615},
            com_post: {lat: 39.113600, lng: -84.527466},
            decon: null,
            radius: 30,
            clear: false,
            edit: false
        },
        {
            id: 5,
            location: {lat: 39.117189, lng: -84.802841},
            casualties: 0,
            type: 'HAZMAT',
            ppe: 'LEVEL B',
            assembly: {lat: 39.116347, lng: -84.799515},
            com_post: {lat: 39.115844, lng: -84.803381},
            decon: {lat: 39.116412, lng: -84.803169},
            radius: 150,
            clear: false,
            edit: false
        },
        {
            id: 6,
            location: {lat: 39.068674, lng: -84.298888},
            casualties: 3,
            type: 'HAZMAT',
            ppe: 'LEVEL C',
            assembly: {lat: 39.066351, lng: -84.296343},
            com_post: {lat: 39.066021, lng: -84.302850},
            decon: {lat: 39.066473, lng: -84.301686},
            radius: 250,
            clear: true,
            edit: false
        },
        {
            id: 7,
            location: {lat: 39.030311, lng: -84.608230},
            casualties: 3,
            type: 'VEHICULAR COLLISION',
            ppe: 'LEVEL D',
            assembly: {lat: 39.030607, lng: -84.607927},
            com_post: {lat: 39.030607, lng: -84.607927},
            decon: null,
            radius: 0,
            clear: false,
            edit: false
        },
        {
            id: 8,
            location: {lat: 39.302596, lng: -84.439124},
            casualties: 2,
            type: 'VEHICULAR COLLISION',
            ppe: 'LEVEL D',
            assembly: {lat: 39.302503, lng: -84.439175},
            com_post: {lat: 39.302503, lng: -84.439175},
            decon: null,
            radius: 0,
            clear: true,
            edit: false
        },
        {
            id: 9,
            location: {lat: 39.157515, lng: -84.292828},
            casualties: 2,
            type: 'OTHER',
            ppe: 'LEVEL D',
            assembly: {lat: 39.157760, lng: -84.292542},
            com_post: null,
            decon: null,
            radius: 0,
            clear: false,
            edit: false
        },
        {
            id: 10,
            location: {lat: 39.050350, lng: -84.494028},
            casualties: 2,
            type: 'OTHER',
            ppe: 'LEVEL D',
            assembly: null,
            com_post: {lat: 39.050674, lng: -84.492918},
            decon: null,
            radius: 0,
            clear: false,
            edit: false
        }
    ];

    app.typeList = [
        {
            type: 'HAZMAT'
        },
        {
            type: 'FIRE'
        },
        {
            type: 'CONFINED SPACE RESCUE'
        },
        {
            type: 'VEHICULAR COLLISION'
        },
        {
            type: 'OTHER'
        },
    ];

    // Create an array of filters
    app.typeFilter = function(x) {
        this.type = x.type;
        this.selected = ko.observable(false);
    };
    /*
    app.weather = function(data) {
        var self = this;
        self.sync = false;
        // Open Weather Maps API call
        var lat = data.lat;
        var lon = data.lng;

        var api = 'http://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lon+'&APPID=00b1eab8137a0b1d81025d667dbb2f17&units=imperial';

        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", api, true);
        xhttp.send(null);
        xhttp.addEventListener('load', function() {
            if(xhttp.status >= 200 && xhttp.status <400) {
                var results = JSON.parse(xhttp.responseText);
                // Store the values from the API results
                var weather_main = results.weather[0].main;
                var weather_temp = results.main.temp;
                var weather_icon = results.weather[0].icon;
                console.log('1 '+self.weather_main());
                var weather_icon_img = 'http://openweathermap.org/img/w/' + weather_icon + '.png';
                self.sync = true;
            } else {
                console.log('Error in network request ' + xhttp.statusText);
                console.log(xhttp);
                console.log(xhttp.status);
                self.sync = true;
            }
        });
        return [{main: weather_main, temp: weather_temp, icon: weather_icon_img}];
    };
    */

    app.EventListing = function(data) {
        var self = this;

        this.id = ko.observable(data.id);
        this.location = ko.observable(data.location);
        this.casualties = ko.observable(data.casualties);
        this.type = ko.observable(data.type);
        this.ppe = ko.observable(data.ppe);
        this.assembly = ko.observable(data.assembly);
        this.com_post = ko.observable(data.com_post);
        this.decon = ko.observable(data.decon);
        this.cas_level = ko.computed(function() {
            if (this.casualties() === 0){
                return "Zero Casualties";
            }
            if (this.casualties() === 1){
                return "Single Casualty Event";
            }
            if (this.casualties() > 1 && this.casualties() < 4){
                return "Multiple Casualty Event";
            }
            if (this.casualties() >= 4){
                return "Mass Casualty Event";
            }
        }, this);
        this.radius = ko.observable(data.radius);
        this.clear = ko.observable(data.clear);
        this.clearOption = ko.computed(function(){
            if (self.clear() === false) {
                return true;
            } else {
                return false;
            }
        });
        this.edit = ko.observable(data.edit);
        this.editOption = ko.computed(function(){
            if (self.edit() === false) {
                return true;
            } else {
                return false;
            }
        });
        this.filters = app.typeList;

        // Establish weather observables
        this.weather_main = ko.observable();
        this.weather_temp = ko.observable();
        this.weather_icon = ko.observable();

        // Determine lat and lng types before passing to API call
        this.lat = function() {
            if (typeof self.location().lat === 'function') {
                return self.location().lat();
            } else {
                return self.location().lat;
            }
        };
        this.lng = function() {
            if (typeof self.location().lng === 'function') {
                return self.location().lng();
            } else {
                return self.location().lat;
            }
        };

        // Get weather using Open Weather API
        var api = 'http://api.openweathermap.org/data/2.5/weather?lat='+this.lat()+'&lon='+this.lat()+'&APPID=00b1eab8137a0b1d81025d667dbb2f17&units=imperial';
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", api, true);
        xhttp.send(null);
        xhttp.addEventListener('load', function() {
            if(xhttp.status >= 200 && xhttp.status <400) {
                var results = JSON.parse(xhttp.responseText);
                // Store the values from the API results
                self.weather_main(results.weather[0].main);
                self.weather_temp(results.main.temp);
                var weather_icon = results.weather[0].icon;
                self.weather_icon('http://openweathermap.org/img/w/' + weather_icon + '.png');
            } else {
                console.log('Error in network request ' + xhttp.statusText);
            }
        });

        // Establish marker data for each type
        this.markerData = [
            {
                title: data.type + ' EVENT',
                position: data.location,
                content: '<div id="content">'+
                    '<label><b>' + data.type + ' EVENT</b></label>' +
                    '<p> Emergency Event #' + data.id + '</p>' +
                    '<p>' + self.cas_level() + '</p>' +
                    '</div>',
                type: 'primary',
                icon: 'icon/' + data.type.replace(/\s+/g, "_") + '.png'
            },
            {
                title: 'Command Post',
                position: data.com_post,
                content: '<div id="content">'+
                    '<p>Command Post</p>' +
                    '</div>',
                type: 'secondary',
                icon: 'icon/' + 'com_post' + '.png'
            },
            {
                title: 'Assembly Point',
                position: data.assembly,
                content: '<div id="content">'+
                    '<p>Assembly Point</p>' +
                    '<p>Casualties: ' + data.casualties + '</p>' +
                    '</div>',
                type: 'secondary',
                icon: 'icon/' + 'assembly' + '.png'
            },
            {
                title: 'Decontamination Point',
                position: data.decon,
                content: '<div id="content">'+
                    '<p>Decontamination Point</p>' +
                    '</div>',
                type: 'secondary',
                icon: 'icon/' + 'decon' + '.png'
            }
        ];

        // Create markers with info windows
        this.markerMaker = function(data) {
            var func = this;

            // Create the marker
            this.marker = new google.maps.Marker({
                    position: data.position,
                    title: data.title,
                    animation: google.maps.Animation.DROP,
                    map: app.map,
                    visible: false,
                    icon: data.icon
            });
            // Add the info window when clicked
            this.marker.addListener('click', function(){
                var mark = this;
                self.infoWindow.open(app.map, func.marker);
                self.infoWindow.setContent(data.content);
                this.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function(){ mark.setAnimation(null); }, 750);
            });
        };

        // Create a hotzone radius
        this.hotzoneMaker = function(data) {
            this.hotzone = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.4,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.075,
                map: app.map,
                center: data.location,
                radius: parseFloat(data.radius)
            });
        };

        this.infoWindow = new google.maps.InfoWindow();

        this.markers =[];
        this.markerData.forEach(function(data){
            if (data.position !== null) {
                self.markers.push(new self.markerMaker(data));
            }
        });

        this.hotzones = [];
        self.hotzones.push(new self.hotzoneMaker(data));
    };

})();