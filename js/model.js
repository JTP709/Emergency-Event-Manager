var app = app || {};

(function(){
    app.initialEmergency = [
        {
            id: 1,
            location: '',
            casualties: 4,
            fire: '',
            hazmat: '',
            ppe: '',
            assembly: '',
            com_post: '',
        },
    ];

    app.Model = function(data) {
        this.id = ko.observable(data.id);
        this.location = ko.observable(data.location);
        this.casualties = ko.observable(data.casualties);
        this.fire = ko.observable(data.fire);
        this.hazmat = ko.observable(data.hazmat);
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
    };
})();