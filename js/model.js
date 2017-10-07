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
    ];

    app.Model = function(data) {
        this.id = ko.observable(data.id);
        this.location = ko.observable(data.location);
        this.casualties = ko.observable(data.casualties);
        this.type = ko.observable(data.type);
        this.ppe = ko.observable(data.ppe);
        this.assembly = ko.observable(data.assembly);
        this.com_post = ko.observable(data.com_post);
        this.cas_level = ko.computed(function() {
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
        this.incidentMarker = new google.maps.Marker({
            position: data.location,
            title: data.type,
            animation: google.maps.Animation.DROP,
            map: null
        });
        console.log('map marker made!')
    };
})();