(function() {
    const $modal = $("#myModal");
    const $warningAlert = $modal.find(".map-warning");
    const repoDataProm = Promise.resolve(WhoEditedMyCode.getRepoData());
    const classDataProm = Promise.resolve(WhoEditedMyCode.getClassData());

    const randomDifferences = [-0.1, -0.05, -0.025, -0.01, 0.01, 0.025, 0.05, 0.1];
    const numRandomDifferences = randomDifferences.length;

    const updateModalTitle = function(title) {
        $modal.find(".modal-title").html(title)
    }

    const updateModalContent = function(title) {
        $warningAlert.attr("hidden", true);
        Promise.all([repoDataProm, classDataProm]).then(results => {
            const {repo:repoData, owner:ownerData, contributors} = results[0];
            const classResults = results[1];

            const classData = classResults[title];

            if (classData) {
                const mapController = WhoEditedMyCode.getMapController();
                mapController.clearMap();
                const ownerLocation = ownerData.geometry.location // owner MUST have latlng
                const contributorsLogin = classData.committers;

                const markers = [{
                    type: "owner",
                    location: ownerLocation,
                    name: ownerData.name,
                    id: ownerData.login,
                    url: ownerData.html_url
                }];
                const lines = [];
                (contributorsLogin || []).forEach(login => {
                    const contributor = contributors[login];
                    if (contributor && contributor.geometry && contributor.geometry.location) {
                        let contributorGeometryLocation = contributor.geometry.location;
                        if (sameLatLng(contributorGeometryLocation, ownerLocation)) {
                            const temp = {
                                lat: contributorGeometryLocation.lat + getRandomDifference(),
                                lng: contributorGeometryLocation.lng + getRandomDifference()
                            }
                            contributorGeometryLocation = temp;
                        }
                        markers.push({
                            type: "committer",
                            location: contributorGeometryLocation,
                            name: contributor.name,
                            id: contributor.login,
                            url: contributor.html_url
                        });

                        lines.push([
                            contributorGeometryLocation,
                            ownerLocation
                        ]);
                    }
                });
                
                mapController.addMarkersAndLines({
                    lines,
                    markers
                });
            } else {
                $warningAlert.attr("hidden", false);
                $warningAlert.html(`No data found for ${title} class, this may be a library function.`)
                console.log(`Could not find ${title} class, this may be a library class.`);
            }
        });
    }

    const sameLatLng = function(location1, location2) {
        return Number(location1.lat) === Number(location2.lat) && 
            Number(location1.lng) === Number(location2.lng);
    }

    const getRandomDifference = function() {
        const randomIndex = Math.floor(Math.random() * numRandomDifferences);
        return randomDifferences[randomIndex];
    }

    const showModal = function() {
        $modal.modal("show");
    }

    $modal.on("shown.bs.modal", () => {
        const mapController = WhoEditedMyCode.getMapController();
        mapController.resizeMap();
    })

    WhoEditedMyCode.getModal = function() {
        return {
            openModal(title) {
                updateModalTitle(title);
                updateModalContent(title);
                showModal();
            }
        }
    }
})()