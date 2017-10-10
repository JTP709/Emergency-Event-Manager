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
            decon: {lat: 39.174987, lng: -84.507533}
        },
        {
            id: 2,
            location: {lat: 39.087383, lng: -84.725753},
            casualties: 0,
            type: 'FIRE',
            ppe: 'Turnout',
            assembly: {lat: 39.085401, lng: -84.725157},
            com_post: {lat: 39.086947, lng: -84.727718},
            decon: null
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

        this.markerData = [
            {
                title: data.type + 'Incident',
                position: data.location,
                content: '<div id="content">'+
                    '<p>' + data.type + ' Event</p>' +
                    '<p>PPE: ' + data.ppe + '</p>' +
                    '<p>Casualties: ' + data.casualties + '</p>' +
                    '</div>'
            },
            {
                title: 'Command Post',
                position: data.com_post,
                content: '<div id="content">'+
                    '<p>Command Post</p>' +
                    '</div>'
            },
            {
                title: 'Assembly Point',
                position: data.assembly,
                content: '<div id="content">'+
                    '<p>Assembly Point</p>' +
                    '</div>'
            },
            {
                title: 'Decontamination Point',
                position: data.decon,
                content: '<div id="content">'+
                    '<p>Decontamination Point</p>' +
                    '</div>'
            }
        ];

        // Create markers with info windows
        this.markerMaker = function(data) {
            var func = this;
            this.marker = new google.maps.Marker({
                    position: data.position,
                    title: data.title,
                    animation: google.maps.Animation.DROP,
                    map: app.map
                });
                this.marker.addListener('click', function(){
                    self.infoWindow.open(app.map, func.marker);
                    self.infoWindow.setContent(data.content);
                });
        };

        this.infoWindow = new google.maps.InfoWindow();

        this.markers =[];
        this.markerData.forEach(function(data){
            if (data.position != null) {
                self.markers.push(new self.markerMaker(data));
            };
        });
    };

})();