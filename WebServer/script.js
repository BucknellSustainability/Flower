// This example displays a marker at the center of Australia.
// When the user clicks the marker, an info window opens.
GOOGLE_MAPS_KEY = 'AIzaSyDhCHwOpcFGA9t6yMul0XCEhhg2mKyJ5mM';
url = 'https://maps.googleapis.com/maps/api/js?key=' + GOOGLE_MAPS_KEY;
JSElement = document.createElement('script');
    JSElement.src = url;
    JSElement.onload = initMap;
    document.getElementsByTagName('body')[0].appendChild(JSElement);

function OnceLoaded() {
    // Once loaded.. load other JS or CSS or call objects of version.js
}

function initMap() {
    //get sites from db
    var siteList = readDB("site","","*");

    markers = []; // array of google map markers
    contents = []; // content for the markers
    iWindows = []; // windows to hold content for onclick

    // iterate through sites in the db
    for (site in siteList) {
        currSite = siteList[site];

        var location = {
            lat: parseFloat(currSite.latitude),
            lng: parseFloat(currSite.longitude),
        };

        contents[site] = '<div id="content">'+
            '<div id="siteNotice">'+'</div>'+
            '<h1 id="firstHeading" class="firstHeading">'+ currSite.name +
            '</h1>'+
            '<div id="bodyContent">' + '<p>' + currSite.description +'</p>' +
            '<p>Site: <a href=' + currSite.link+ '>Current ' + currSite.name +
            ' Projects</a></p>'+
            '</div>'+
            '</div>';

        markers[site] = new google.maps.Marker({
            position: location,
            map: map,
            title: 'Energy Hill',
            animation: google.maps.Animation.DROP,
        });
        markers[site].index = site;

        iWindows[site] = new google.maps.InfoWindow({
            content: contents[site],
            pixelOffset: new google.maps.Size(0, -20),
        });

        google.maps.event.addListener(markers[site], 'click', function() {
            for (i in iWindows) {
                iWindows[i].close();
                markers[i].setAnimation(null);
            }
            iWindows[this.index].open(map, markers[this.index]);
            map.panTo(markers[this.index].getPosition());
            markers[this.index].setAnimation(google.maps.Animation.BOUNCE);
        });
    }

    // close info windows on click off
    google.maps.event.addListener(map, 'click', function() {
        for (i in iWindows) {
            iWindows[i].close();
            markers[i].setAnimation(null);
        }
    });
}
