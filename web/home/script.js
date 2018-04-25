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

function initMap() {
    //get sites from db

    console.log("Initializing Map");
    var energyHill = {lat: 40.950409, lng: -76.882382}; //Energy Hill: 40.950409, -76.882382
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: energyHill
    }); //define map & starting location


    var siteList = [];

    var xhr = new XMLHttpRequest();
    var url = 'http://eg.bucknell.edu/energyhill/get-map-points'
    xhr.open('GET', url);
    xhr.withCredentials = true;
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    const scope = this;
    xhr.onload = function() {
        siteList = xhr.response;
        fillMap(map, siteList)
    };
    xhr.send();
}

function fillMap(map, siteList){

    var markers = [];     //array of google map markers
    var contents = [];    //content for the markers
    var iWindows = [];    //windows to hold content for onclick

    for (var site in siteList) {
        console.log("NEW SITE")
        var currSite = siteList[site]

        var location = {lat: parseFloat(currSite.latitude), lng: parseFloat(currSite.longitude)};
        contents[site] = currSite.content

        markers[site] = new google.maps.Marker({
          position: location,
          map: map,
          title: 'Energy Hill',
          animation: google.maps.Animation.DROP
        });
        markers[site].index = site;

        iWindows[site] = new google.maps.InfoWindow({
          content: contents[site],
          pixelOffset: new google.maps.Size(0,-20)
        });

        google.maps.event.addListener(markers[site], 'click', function () {
            for (var i in iWindows){
                iWindows[i].close()
                markers[i].setAnimation(null);
            }
            iWindows[this.index].open(map,markers[this.index]);
            map.panTo(markers[this.index].getPosition());
            markers[this.index].setAnimation(google.maps.Animation.BOUNCE);
        });
  }

  //close info windows on click off
  google.maps.event.addListener(map, 'click', function() {
    for (var i in iWindows){
      iWindows[i].close();
      markers[i].setAnimation(null);
    }
  });
}
