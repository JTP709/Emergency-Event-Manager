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
            clear: false
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
            clear: false
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
            clear: false
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
            clear: false
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
            clear: false
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
            clear: true
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
            clear: false
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
            clear: true
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
            clear: false
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
            clear: false
        }
    ];

    app.EventListing = function(data) {
        var self = this;

        this.id = ko.observable(data.id);
        this.location = ko.observable(data.location);
        this.casualties = ko.observable(data.casualties);
        this.type = ko.observable(data.type);
        this.ppe = ko.observable(data.ppe);
        this.assembly = ko.observable(data.assembly);
        this.com_post = ko.observable(data.com_post);
        this.cas_level = ko.computed(function() {
            if (this.casualties() === 0){
                return "Zero Casualties"
            };
            if (this.casualties() === 1){
                return "Single Casualty Event"
            };
            if (this.casualties() > 1 && this.casualties() < 4){
                return "Multiple Casualty Event"
            };
            if (this.casualties() >= 4){
                return "Mass Casualty Event"
            }; 
        }, this);
        this.radius = ko.observable(data.radius);
        this.clear = ko.observable(data.clear);
        this.clearOption = ko.computed(function(){
            if (self.clear() == false) {
                return true
            } else {
                return false
            }
        });

        this.markerData = [
            {
                title: data.type + ' EVENT',
                position: data.location,
                content: '<div id="content">'+
                    '<label><b>' + data.type + ' EVENT</b></label>' +
                    '<p> Emergency Event #' + data.id + '</p>' +
                    '<p>' + this.cas_level() + '</p>' +
                    '</div>',
                type: 'primary'
            },
            {
                title: 'Command Post',
                position: data.com_post,
                content: '<div id="content">'+
                    '<p>Command Post</p>' +
                    '</div>',
                type: 'secondary'
            },
            {
                title: 'Assembly Point',
                position: data.assembly,
                content: '<div id="content">'+
                    '<p>Assembly Point</p>' +
                    '<p>Casualties: ' + data.casualties + '</p>' +
                    '</div>',
                type: 'secondary'
            },
            {
                title: 'Decontamination Point',
                position: data.decon,
                content: '<div id="content">'+
                    '<p>Decontamination Point</p>' +
                    '</div>',
                type: 'secondary'
            }
        ];

        // This function takes in a COLOR, and then creates a new marker
        // icon of that color. The icon will be 21 px wide by 34 high, have an origin
        // of 0, 0 and be anchored at 10, 34).
        app.makeMarkerIcon = function(markerColor) {
            var markerImage = new google.maps.MarkerImage(
                'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
                '|40|_|%E2%80%A2',
                new google.maps.Size(21, 34),
                new google.maps.Point(0, 0),
                new google.maps.Point(10, 34),
                new google.maps.Size(21,34));
            return markerImage;
        };

        // Create markers with info windows
        this.markerMaker = function(data) {
            var func = this;
            // Defaust icon color and image
            this.defaultIcon = app.makeMarkerIcon('ff0000');
            // Create the marker
            this.marker = new google.maps.Marker({
                    position: data.position,
                    title: data.title,
                    animation: google.maps.Animation.DROP,
                    map: app.map,
                    visible: false,
                    icon: this.defaultIcon
            });
            this.marker.addListener('click', function(){
                self.infoWindow.open(app.map, func.marker);
                self.infoWindow.setContent(data.content);
            });
            // Change marker color when hovering over
            this.highlightedIcon = app.makeMarkerIcon('FFFF24');
            this.marker.addListener('mouseover', function() {
                this.setIcon(func.highlightedIcon);
              });
            this.marker.addListener('mouseout', function() {
                this.setIcon(func.defaultIcon);
            });
        };

        // Create a hotzone radius
        this.hotzoneMaker = function(data) {
            var func = this;
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
            if (data.position != null) {
                self.markers.push(new self.markerMaker(data));
            };
        });

        this.hotzones = [];
        self.hotzones.push(new self.hotzoneMaker(data));
    };

})();