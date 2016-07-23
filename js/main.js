
//search input listeners
$('#search-input').on("change", showClearSearchBox);

//clear search input button listener
$('.clear').on("click", clearSearchBox);

//expand button listener

$('.creator-expand-btn').on("click", showCreatorContent);
$('.purpose-expand-btn').on("click", showPurposeContent);
$('.tech-expand-btn').on("click", showTechContent);


$('.hamburger-box').on('click', showBurgerMenu);

$(document).ready(function(){
	setInterval(getWeather, 5000);
});

function showBurgerMenu(){
  $('.header-nav').slideToggle('burger-nav');
}

function showClearSearchBox(){
  $('.clear').show();
}

function clearSearchBox(){
  $('#search-input').val('');
  $('.clear').hide();
}


function showCreatorContent(){

  if($('.creator-section').hasClass('active')){
    $('.creator-sub-info').slideUp().removeClass('open').addClass('closed');
    $('.creator-section').removeClass('active').addClass('inactive');
    $('.creator-expand-btn').text('+');
  }

  else if($('.creator-section').hasClass('inactive')){
    $('.creator-sub-info').slideDown().removeClass('closed').addClass('open');
    $('.creator-section').removeClass('inactive').addClass('active');
    $('.creator-expand-btn').text('-');
  }
}

function showPurposeContent(){

  if($('.purpose-section').hasClass('active')){
    $('.purpose-sub-info').slideUp().removeClass('open').addClass('closed');
    $('.purpose-section').removeClass('active').addClass('inactive');
    $('.purpose-expand-btn').text('+');
  }

  else if($('.purpose-section').hasClass('inactive')){
    $('.purpose-sub-info').slideDown().removeClass('closed').addClass('open');
    $('.purpose-section').removeClass('inactive').addClass('active');
    $('.purpose-expand-btn').text('-');
  }
}

function showTechContent(){

  if($('.tech-section').hasClass('active')){
    $('.tech-sub-info').slideUp().removeClass('open').addClass('closed');
    $('.tech-section').removeClass('active').addClass('inactive');
    $('.tech-expand-btn').text('+');
  }

  else if($('.tech-section').hasClass('inactive')){
    $('.tech-sub-info').slideDown().removeClass('closed').addClass('open');
    $('.tech-section').removeClass('inactive').addClass('active');
    $('.tech-expand-btn').text('-');
  }
}

//Weather Widget

//Get User's location
if("geolocation" in navigator){
  navigator.geolocation.getCurrentPosition(function(position){
    //invoke the loadWeather function to get the weather
    loadWeather(position.coords.latitude + ',' + position.coords.longitude); 
  });
  //if the geolocation does not work, default to boston's weather
} else {
  loadWeather("Boston, MA", ""); 
}

function loadWeather(location, woeid){
	$.simpleWeather({
		location: location,
		woeid: woeid,
		unit: 'f',
		success: function(weather){  
			city = weather.city;
			temp = weather.temp +'&deg;';
			wcode = '<img class="weathericon" src="img/widget_images/' + weather.code + '.svg">';
			wind =  '<p>' + weather.wind.speed + ' ' + weather.units.speed + '</p>'; 
			humidity = weather.humidity + ' %';

      //Place the weather widget content
			$(".location").text(city);
			$(".temperature").html(temp);
			$(".climate_bg").html(wcode);
			$(".windspeed").html(wind);
			$(".humidity").text(humidity);
		},

		error: function(error){
			$(".error").html('<p>' + error + '</p>');
		}
	})
}

/////////////////////////Google Maps + Places API code//////////////////////////////

//Search Bar Autocomplete and associating the search bar to the UI.
var autocomplete; //autocomplete listener
var input; //listener variable

// //go button
// var goButton = document.getElementById('go-button');

//location button
var getLocationButton = document.getElementById('location-button');

//map variables
var map;
var my_location_info = new google.maps.InfoWindow(); //a pop that contains your location's information (name, etc.)
var gas_station_info = new google.maps.InfoWindow(); //a pop up that contains gas station information (name, etc.)
var request;
var service;
var markers = []; //array of location markers

//map icons
var my_location_marker = 'https://maps.gstatic.com/mapfiles/ms2/micons/rangerstation.png'
var gas_icon = 'https://maps.gstatic.com/mapfiles/ms2/micons/gas.png';


//Initialize the map

function initialize() {

   //centered for Boston by default
   var center = new google.maps.LatLng(42.3418994,-71.0990471); 

   // place the map in the container
   map = new google.maps.Map(document.getElementById('map'), {  
     	center: center,
     	zoom: 12
   });

   //request for the default location of BOSTON when the map loads...
   request = {
    location: center,
    radius: 8047, //8047 meters = a radius of 5 miles from your position
    types: ['gas_station']
   };

   //AUTOCOMPLETE initialization

   input = /** @type {!HTMLInputElement} */(
      document.getElementById('search-input'));

   //Tie the autocomplete to the input field
   autocomplete = new google.maps.places.Autocomplete(input);

   //set the autocomplete results to be biased to the bounds of the map
   autocomplete.bindTo('bounds', map);

   //your location marker
   var myMarker = new google.maps.Marker({
      map: map,
      position: center,
      icon: my_location_marker
   });

  //ties the autocomplete to the input, and listens for a place_changed event if the user were to type a different location
  autocomplete.addListener('place_changed', function(){

    //clear all markers
    clearResults(markers)
    //by default close your location's info window, and set the marker to not visible
    my_location_info.close();

    myMarker.setVisible(false);

    //getPlace() returns a MarkerPlace object which can return a place's location (lat / lng), placeID (place details)
    var place = autocomplete.getPlace();

    // If the place does not have a geometry based on the lat / lng that's acquired, then return the alert
    if( !place.geometry ){
      window.alert("Autocomplete's returned place contains no geometry");
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
    } else {
        map.setCenter(place.geometry.location);
        map.setZoom(12);  
    }

    //place the user's location marker in the area they inputted, and make it visible
    myMarker.setPosition(place.geometry.location);
    myMarker.setVisible(true);

    //when a marker is clicked, provide the information of the the location
    google.maps.event.addListener(myMarker, 'click', function(){
      my_location_info.setContent(
      '<div><strong>' + place.name + '</strong><br>' +
          place.vicinity + '</div>');
      my_location_info.open(map, this);
    });

    //Gas station search request
    var gas_search = {
      latLng: place.geometry.location
    };

    google.maps.event.trigger(map, 'rightclick', gas_search);

   }); //End of input listener

   //search for nearby gas_stations
   service = new google.maps.places.PlacesService(map);
   service.nearbySearch(request, callback);

   //location button
   getMyLocationButton(map, myMarker);

   //right click event function
   rightClickMap();
}

function rightClickMap(){
   //listener that waits for a right click on the map, and then finds the closest gas stations on the location that was right-clicked
   google.maps.event.addListener(map, 'rightclick', function(event){
      map.setCenter(event.latLng)
      clearResults(markers)

      //the search request for gas stations in the area
      var request = {
        location: event.latLng, //center to where the right click was made
        radius: 8047, //5 mile radius
        types: ['gas_station']
      };

      //do a nearbySearch based on the 'request' with a callback function
      service.nearbySearch(request, callback);
   })
}

//gets location of all gas stations and adds them to a results array
//it takes the results of the request, and the status tied to each result
function callback(results, status){
  //look for specified places (gas stations)
	if(status == google.maps.places.PlacesServiceStatus.OK){
		//take all results, create markers for them and place them in the markers[] array
    for(var i = 0; i < results.length; i++){
			markers.push(createMarker(results[i]));
		}
	}
}

//create and place markers on the map when a gas station is found nearby (5 mile radius)
function createMarker(place){

  //gas station's location
	var placeLoc = place.geometry.location;

  //place a marker on the gas station location
	var marker = new google.maps.Marker ({
		map: map,
		position: placeLoc,
    icon: gas_icon
	});

	//when a gas station marker is clicked on the map, provide the information of the gas_station
	google.maps.event.addListener(marker, 'click', function(){
		gas_station_info.setContent(
		'<div><strong>' + place.name + '</strong><br>' +
        place.vicinity + '<br>' + '</div>');
		gas_station_info.open(map, this);
	});

	return marker;
}

//everytime a new location is selected or entered, the markers from the previous location are removed
function clearResults(markers){
	for(var m in markers){
		markers[m].setMap(null)
	}
	markers = []
}

function getMyLocationButton(map, marker){
  
  //Get Location button listener
  getLocationButton.addEventListener('click', function(){
    //clear markers on the map
    clearResults(markers)
    //Use the geolocation service to get user's current location (e.g Lat / Long)
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        //based on the Lat / Lngs returned, place a marker and center to that location on the map
        marker.setPosition(latlng);
        map.setCenter(latlng);

        //Gas station search request
        var gas_search = {
          latLng: latlng
        };

        //trigger a nearby search using the 'rightclick event'
        google.maps.event.trigger(map, 'rightclick', gas_search);

      });
    }
  });

}

google.maps.event.addDomListener(window, 'load', initialize);


