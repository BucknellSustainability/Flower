// This example displays a marker at the center of Australia.
// When the user clicks the marker, an info window opens.

var url = "https://maps.googleapis.com/maps/api/js?key=" + config.GOOGLE_MAPS_KEY + "&callback=initMap";
var JSElement = document.createElement('script');
    JSElement.src = url;
    JSElement.onload = OnceLoaded;
    document.getElementsByTagName('body')[0].appendChild(JSElement);

function OnceLoaded() {
    // Once loaded.. load other JS or CSS or call objects of version.js
}

function initMap() {
    var energyHill = {lat: 40.950409, lng: -76.882382}; //Energy Hill: 40.950409, -76.882382
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: energyHill
    });

    // later to be populated from the sites table in the DB
    var contentString = '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<h1 id="firstHeading" class="firstHeading">Energy Hill</h1>'+
      '<div id="bodyContent">'+
      '<p><b>Energy Hill</b>, blah </p>'+
      '<p>Site: <a href="http://sustainable.scholar.bucknell.edu">link</a></p>'+
      '</div>'+
      '</div>';

    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });

    var marker = new google.maps.Marker({
      position: energyHill,
      map: map,
      title: 'Energy Hill'
    });
    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });

}
