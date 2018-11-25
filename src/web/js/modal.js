(function() {
    const $modal = $("#myModal");
    const $warningAlert = $modal.find(".map-warning");
    const $classDetails = $modal.find(".class-details");
    const $functionsCard = $modal.find("#functions-card-body");
    const $contributorsCard = $modal.find("#contributors-card-body");
    const repoDataProm = Promise.resolve(WhoEditedMyCode.getRepoData());
    const classDataProm = Promise.resolve(WhoEditedMyCode.getClassData());

    const randomDifferences = [-0.1, -0.05, -0.025, -0.01, 0.01, 0.025, 0.05, 0.1];
    const numRandomDifferences = randomDifferences.length;


    /* Start Class-Details Card */
    const ContributorListEntry = ({ url, img, name, login, localTimeString }) => `
        <a href="${url}" target="_blank" class="list-group-item list-group-item-action">
            <div>
                <img style="border-radius:0.25rem;"src="${img}&s=48"/>
                <strong>${name}</strong>
            </div>
            <div>
                <span>@${login}</span>
                <i class="fas fa-external-link-alt"></i>
            </div>
              
            <p class="card-text">
                <small class="text-muted">${localTimeString}</small>
            </p>
               
        </a>
    `;
    const setContributorsCard = function(htmlString) {
        $contributorsCard.find(".list-group").html(htmlString);
    }
    const clearContributorsCard = function() {
        setContributorsCard("");
    }
    const updateContributorsCard = function(contributors) {
        const contributorsEntryDetails = contributors.map(({html_url, login, name, avatar_url, timezone}) => {
            let localTimeString = "";
            if (timezone) {
                localTimeString = moment.tz(timezone.timeZoneId).format("MMM Do YYYY, h:mm:ss A");
                localTimeString = `Local Time: ${localTimeString}`
            }
            return {
                url: html_url,
                img: avatar_url,
                name: name || "N/A",
                login: login || "N/A",
                localTimeString
            }
        });
        setContributorsCard(contributorsEntryDetails.map(ContributorListEntry).join(''));
    }
    

    const FunctionsListEntry = ({ functionName, repoFullName, filePath, line }) => `
        <a href="https://github.com/${repoFullName}/blame/master/${filePath}#L${line}" target="_blank" class="list-group-item list-group-item-action">
            <span>${functionName}</span>
            <i class="fas fa-external-link-alt"></i>  
        </a>
    `;
    const setFunctionsCard = function(htmlString) {
        $functionsCard.find(".list-group").html(htmlString);
    }
    const clearFunctionsCard = function() {
        setFunctionsCard("");
    }
    const updateFunctionsCard = function(functions, repoFullName, filePath) {
        let filePathRemoveSlash = filePath;
        if (filePath[0] === "/") {
            filePathRemoveSlash = filePath.substring(1);
        }

        const functionsEntryDetails = functions.map(({functionName, line}) => ({
            line,
            functionName,
            repoFullName,
            filePath: filePathRemoveSlash
        }));

        setFunctionsCard(functionsEntryDetails.map(FunctionsListEntry).join(''));
    }

    /* End Class-Details Card */
    

    const updateModalTitle = function(title) {
        $modal.find(".modal-title").html(title)
    }

    const updateModalContent = function(title) {
        $warningAlert.attr("hidden", true);
        clearFunctionsCard();
        clearContributorsCard();
        Promise.all([repoDataProm, classDataProm]).then(results => {
            const {repo:repoData, owner:ownerData, contributors} = results[0];
            const classResults = results[1];

            const classData = classResults[title];
            const mapController = WhoEditedMyCode.getMapController();
            mapController.clearMap();

            if (classData) {
                const ownerLocation = ownerData.geometry.location // owner MUST have latlng
                const contributorsLogin = classData.committers;
                const classFunctions = classData.functions;
                const filePath = classData.filepath;

                const markers = [];
                const lines = [];
                const contributorsList = [];
                (contributorsLogin || []).forEach(login => {
                    const contributor = contributors[login];
                    if (contributor) {
                        contributorsList.push(contributor); // for contributors card
                    }

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
                            contributor
                        });

                        lines.push([
                            contributorGeometryLocation,
                            ownerLocation
                        ]);
                    }
                });

                updateContributorsCard(contributorsList);
                updateFunctionsCard(classFunctions, repoData.full_name, filePath);
                
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