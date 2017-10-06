var app = app || {};

(function() {
    app.ViewModel = function() {
        var self = this;
        // Navigation Bar Functions
        var new_tab = document.getElementById('new_tab');
        var map_tab = document.getElementById('map_tab');
        new_tab.style.display = 'none';
        this.nav = function() {
            var x = new_tab;
            var y = map_tab;
            if (x.style.display === 'none') {
                x.style.display = 'block';
                y.style.display = 'none';
            } else {
                x.style.display = 'none';
                y.style.display = 'block';
            };
        }
        // Create an observable array and populate
        this.emergencyList = ko.observableArray([]);
        app.initialEmergency.forEach(function(item){
            self.emergencyList.push(new app.Model(item));
        });
        
        // TODO create a form to input new emergency data and add to the array
    };
})();