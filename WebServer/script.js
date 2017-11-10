// This example displays a marker at the center of Australia.
// When the user clicks the marker, an info window opens.
       GOOGLE_MAPS_KEY = "AIzaSyDhCHwOpcFGA9t6yMul0XCEhhg2mKyJ5mM";
       var url = "https://maps.googleapis.com/maps/api/js?key=" + GOOGLE_MAPS_KEY + "&callback=initMap";
       var JSElement = document.createElement('script');
           JSElement.src = url;
           JSElement.onload = OnceLoaded;
           document.getElementsByTagName('body')[0].appendChild(JSElement);

function OnceLoaded() {
    // Once loaded.. load other JS or CSS or call objects of version.js
}

//Reads sites from amazon rds
function readSites(){
var sites = [];
$.ajax({
  type: 'GET',
  url: 'api.php',
  success: function(json) {
    $.each(JSON.parse(json), function(key,value) {
      sites.push(value); //value = json object for site
    });
    console.log("Sucessfully Read from DB");
  },
  error: function() {
    alert('Error Reading from DB');
  },
  async: false  //important. Makes sure init map waits till this is done.
  });
  return sites;
}

function initMap() {
    //get sites from db
    var siteList = readSites(function(){});

    console.log("Initializing Map");
    var energyHill = {lat: 40.950409, lng: -76.882382}; //Energy Hill: 40.950409, -76.882382
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: energyHill
    }); //define map & starting location

    var markers = [];     //array of google map markers
    var contents = [];    //content for the markers
    var iWindows = [];    //windows to hold content for onclick

    //iterate through sites in the db
    for (var site in siteList) {
        var currSite = siteList[site]

        var location = {lat: parseFloat(currSite.latitude), lng: parseFloat(currSite.longitude)};
        contents[site] = '<div id="content">'+
          '<div id="siteNotice">'+'</div>'+'<h1 id="firstHeading" class="firstHeading">'+ currSite.name + '</h1>'+
          '<div id="bodyContent">' + '<p>' + currSite.description +'</p>' +
          '<p>Site: <a href=' + currSite.link+  '>Current ' + currSite.name + ' Projects</a></p>'+
          '</div>'+
          '</div>';

        markers[site] = new google.maps.Marker({
          position: location,
          map: map,
          title: 'Energy Hill',
        });
        markers[site].index = site;

        iWindows[site] = new google.maps.InfoWindow({
          content: contents[site]
        });

        google.maps.event.addListener(markers[site], 'click', function () {
            for (var i in iWindows){
                iWindows[i].close()
            }
            iWindows[this.index].open(map,markers[this.index]);
            map.panTo(markers[this.index].getPosition());
        });
  }

  //close info windows on click off
  google.maps.event.addListener(map, 'click', function() {
    for (var i in iWindows){
      iWindows[i].close()
    }
  });
}
