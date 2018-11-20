(function() {
    let gmap;
    let lines = [];
    let markers = []; 
    let latlngbounds;
    
    const vancouverLatLng = { lat: 49.246292, lng: -123.116226 }

    function initMap() {
        gmap = new google.maps.Map(document.getElementById("map"));

        latlngbounds = new google.maps.LatLngBounds(null);
    }

    function addLinesToMap(map) {
        lines.forEach(line => {
            line.setMap(map);
        });
    }

    function addMarkersToMap(map) {
        markers.forEach(marker => {
            marker.setMap(map);
        });
    }

    function addMarkers(markersDetails) {
        (markersDetails || []).forEach(({location}) => {
            const marker = new google.maps.Marker({
                position: location
            });
            markers.push(marker);
            latlngbounds.extend(marker.getPosition());
        });
        addMarkersToMap(gmap);
    }

    function addLines(linesPaths) {
        (linesPaths || []).forEach(linePath => {
            const line = new google.maps.Polyline({
                path: linePath,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 5
            });
            lines.push(line);
            extendBounds(line.getPath());
        });
        addLinesToMap(gmap);
    }

    function clearMarkers() {
        addMarkersToMap(null)
        markers = [];
    }

    function clearLines() {
        addLinesToMap(null);
        lines = [];
    }

    function clearMap() {
        latlngbounds = new google.maps.LatLngBounds(null);
        clearMarkers();
        clearLines();
    }

    function resizeMap() {
        fitNewBounds();
        google.maps.event.trigger(gmap, "resize");
    }

    function extendBounds(locations) {
        locations.forEach(location => {
            latlngbounds.extend(location);
        });
    }

    function fitNewBounds() {
        console.log("Before" + gmap.getBounds())
        gmap.fitBounds(latlngbounds);
        console.log("After" + gmap.getBounds())
    }

    WhoEditedMyCode.getMapController = function() {
        return {
            clearMap: function() {
                clearMap();
            },
            addMarkersAndLines: function(data) {
                addMarkers(data.markers);
                addLines(data.lines);
                fitNewBounds();
            },
            resizeMap: function() {
                resizeMap();
            }
        }
    }

    window.initMap = function() {
        window.initMap = null; // set this to null this so that it can't get called anymore....if you want
        initMap();
    };
})()