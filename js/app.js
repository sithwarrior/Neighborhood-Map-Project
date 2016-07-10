//Set as global, so it can be referenced from everywhere
var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    //center on denmark
    center: {"lat" : 56.26392,
         "lng" : 9.501785},
    zoom: 6,
    //project description mentions fullscreenControl
    fullscreenControl: true
  });

  //our Superchargers
  var chargers = [
    {name: 'Hjørring Supercharger', location : {"lat": 57.455824, "lng": 10.041378}, adress: 'Sprogøvej 1, 9800 Hjørring'},
    {name: 'København-Kastrup Supercharger', location : {"lat" : 55.614292, "lng" : 12.61353}, adress: 'Kirstinehøj 43, 2770 Kastrup'},
    {name: 'Køge Supercharger', location : {"lat" : 55.4890312, "lng" : 12.1619121}, adress: 'Servicevej 2, 4600 Køge'},
    {name: 'Middelfart Supercharger', location : {"lat" : 55.510175, "lng" : 9.765445}, adress: 'Karensmindevej 3, 5500 Middelfart'},
    {name: 'Nørre Alslev Supercharger', location : {"lat" : 54.90029449999999, "lng" : 11.8977854}, adress: 'Cargovej 4, 4840 Nørre Alslev'},
    {name: 'Randers Supercharger', location : {"lat" : 56.43338430000001, "lng" : 10.0544815}, adress: 'Graceland Randersvej 3, 8960 Randers'},
    {name: 'Rødekro Supercharger', location : {"lat" : 55.067667, "lng" : 9.361094}, adress: 'Kometvej 1, 6230 Rødekro'},
    {name: 'Slagelse Supercharger', location : {"lat" : 55.387574, "lng" : 11.362179}, adress: 'Trafikcenter Alle 4, 4200 Slagelse'}
  ];

  //const used for the icon on markers
  var image = "images/icon-supercharger.png";

  //setting up a marker for each supercharger
  for (var i = 0; i < chargers.length; i++) {

    var contentString = "<div><h3>"+ chargers[i].name +"</h3></div>"
    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });

    chargers[i].marker = new google.maps.Marker({
      position: chargers[i].location,
      map: map,
      icon: image,
      title: chargers[i].name,
      animation: google.maps.Animation.DROP,
      id: i
    });

    chargers[i].marker.addListener('click', function() {
      populateInfoWindow(this, infowindow);
    });
  }

  function superchargersViewModel() {
    var self = this;
    self.filter = ko.observable("");

    self.superchargers = ko.observableArray(chargers);

    self.select = function(item) {
      populateInfoWindow(item.marker, infowindow);
    };

    self.filteredSuperchargers = ko.computed(function(){
      //filter and comparision is set to lowercase, to avoid casesensitivity
      var filter = self.filter().toLowerCase();
      if (!filter) {
        for (var i = 0; i < self.superchargers().length; i++) {
          //make sure all markers are displayed if no filter
          self.superchargers()[i].marker.setMap(map);
        }
        //return complete list of superchargers if no filter
        return self.superchargers();
      }
      else {
        return ko.utils.arrayFilter(self.superchargers(), function(item) {
          if (item.name.toLowerCase().indexOf(filter) >= 0){
              //display marker if matches filter
              item.marker.setMap(map);
              return item;
          }
          else {
            //hide place from map if not match for filter
            item.marker.setMap(null);
          }
        })
      }
    })
  };

  //bind viewmodel
  ko.applyBindings(new superchargersViewModel());

};

function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    //play bounce Animation, remove again with setTimeout.
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null); }, 750);
    //set initial content of infowindow
    infowindow.setContent('<div>' + marker.title + '</div>');

    //getting weather form openweathermap API async.
    jQuery.getJSON("http://api.openweathermap.org/data/2.5/weather?lat="+ marker.internalPosition.lat() + "&lon=" + marker.internalPosition.lng() +"&appid=f8197cd91bc3bd5126f7653a298ea25e", function(data) {
      console.log(data);
      var logoUrl = "http://openweathermap.org/img/w/"+ data.weather[0].icon +".png";
      infowindow.setContent(infowindow.getContent() + "<img src="+ logoUrl +">"+ data.weather[0].description +"");
    }).fail(function( jqxhr, textStatus, error ) {
      var err = textStatus + ", " + error;
      infowindow.setContent(infowindow.getContent() + "<p>Problem getting weather data</p>");
      console.log( "Request Failed: " + err );
    });

    infowindow.marker = marker;
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      //Detach infowindow from marker
      infowindow.marker = null;
    });
  }
}
