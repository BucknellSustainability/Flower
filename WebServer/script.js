// This example displays a marker at the center of Australia.
// When the user clicks the marker, an info window opens.
GOOGLE_MAPS_KEY = 'AIzaSyDhCHwOpcFGA9t6yMul0XCEhhg2mKyJ5mM';
url = 'https://maps.googleapis.com/maps/api/js?key=' + GOOGLE_MAPS_KEY;
JSElement = document.createElement('script');
    JSElement.src = url;
    JSElement.onload = initMap;
    document.getElementsByTagName('body')[0].appendChild(JSElement);

/**
Reads sites from amazon rds
@return {array} sites
*/
function readSites() {
    sites = [];
    $.ajax({
        type: 'GET',
        url: 'api.php',
        success: function(json) {
            $.each(JSON.parse(json), function(key, value) {
                sites.push(value); // value = json object for site
            });
            console.log('Sucessfully Read from DB');
        },
        error: function() {
            alert('Error Reading from DB');
        },
        async: false, // important. Makes sure init map waits till this is done.
    });
    return sites;
}

/**
    Initialized Google Map
*/
function initMap() {
    // get sites from db
    siteList = readSites(function() {});

    console.log('Initializing Map');
    // Energy Hill: 40.950409, -76.882382
    energyHill = {lat: 40.950409, lng: -76.882382};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: energyHill,
    }); // define map & starting location

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
