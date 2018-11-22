(function() {
    let gmap;
    let ownerMarker;
    let lines = [];
    let markers = []; 
    let latlngbounds;
    const markerSize = 30;
    const repoDataProm = Promise.resolve(WhoEditedMyCode.getRepoData());

    function initMap() {
        gmap = new google.maps.Map(document.getElementById("map"), {
            streetViewControl: false,
        });

        latlngbounds = new google.maps.LatLngBounds(null);
        return getOwnerAndPlot();
    }

    function getOwnerAndPlot() {
        return Promise.resolve(repoDataProm).then(({repo, owner, contributors}) => {
            const ownerLocation = owner.geometry.location // owner MUST have latlng
            ownerMarker = new google.maps.Marker({
                position: ownerLocation,
                map: gmap,
                icon: createIconWithUrl(owner.avatar_url),
                zIndex: 999
            });
            return ownerMarker;
        });
    }

    function createIconWithUrl(url) {
        return {
            url,
            scaledSize: new google.maps.Size(markerSize, markerSize), // scaled size
            origin: new google.maps.Point(0, 0), // origin
            anchor: new google.maps.Point(markerSize/2, markerSize/2) // anchor
        };
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
        (markersDetails || []).forEach(({contributor, location}) => {
            const marker = new google.maps.Marker({
                position: location,
                icon: createIconWithUrl(contributor.avatar_url)
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
        if (ownerMarker) {
            latlngbounds.extend(ownerMarker.getPosition());
        }
        gmap.fitBounds(latlngbounds);

        if (ownerMarker && lines.length < 1 && markers.length < 1) { // handle only owner marker
            gmap.setZoom(10)
        }
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