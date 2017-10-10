var app = app || {};

(function(){
    app.initialEmergency = [
        {
            id: 1,
            location: {lat: 39.173853, lng: -84.507786},
            casualties: 4,
            type: 'HAZMAT',
            ppe: 'Level A',
            assembly: {lat: 39.176411, lng: -84.507937},
            com_post: {lat: 39.175396, lng: -84.507062},
        },
        {
            id: 2,
            location: {lat: 39.087383, lng: -84.725753},
            casualties: 0,
            type: 'FIRE',
            ppe: 'Turnout',
            assembly: {lat: 39.085401, lng: -84.725157},
            com_post: {lat: 39.086947, lng: -84.727718},
        }
    ];

    app.EventListing = function(data) {
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
        this.selected = ko.observable(false);
    };
    
    app.EventMarkers = function(data) {
        var contentString = '<div id="content">'+
            '<p>' + data.type + ' Event</p>' +
            '<p>Hotzone</p>' +
            '<p>PPE: ' + data.ppe + '</p>' +
            '<p>Casualties: ' + data.casualties + '</p>' +
            '</div>';

        // Incident Marker and Info Window maker
        this.incidentMarker = new google.maps.Marker({
            position: data.location,
            title: data.type + 'Incident',
            animation: google.maps.Animation.DROP,
            map: app.map
        });
        var infoWindow = new google.maps.InfoWindow({
            content: contentString,
            position: data.location
        });
        this.incidentMarker.addListener('click', function(){
            infoWindow.open(app.map, this.incidentMarker)
        });

        // Command Post Marker and Info Window maker
        this.comPostMarker = new google.maps.Marker({
            position: data.com_post,
            title: 'Command Post',
            animation: google.maps.Animation.DROP,
            map: app.map
        });

        // Assembly Point Marker and Info Window maker
        this.assemblyPointMarker = new google.maps.Marker({
            position: data.assembly,
            title: 'Assembly Point',
            animation: google.maps.Animation.DROP,
            map: app.map
        });
        this.id = ko.observable(data.id);
        this.selected = ko.observable(false);
    };
    
})();