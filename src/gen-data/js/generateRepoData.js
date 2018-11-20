(function(){
    const fs = require('fs');
    const Git = require("nodegit");
    const octokit = require('@octokit/rest')();
    const gmaps = require('@google/maps');
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GMAPS_API_KEY = process.env.GMAPS_API_KEY;
    const args = process.argv.slice(2);

    if (args.length != 1) {
        console.error("Only supports 1 argument.");
        process.exit(1);
    }

    if (!GITHUB_TOKEN) {
        throw "No Github Token in environment variables, add one please!";
    }

    if (!GMAPS_API_KEY) {
        throw "No Google Maps API Key in environment variables, add one please!";
    }

    const googleMapsClient = gmaps.createClient({
        key: GMAPS_API_KEY,
        Promise: Promise
      });

    octokit.authenticate({
        type: "oauth",
        token: GITHUB_TOKEN
    });

    const path = args[0];
    const repoOwnerAndName = Promise.resolve(
        Git.Repository.open(path).then(repository => {
            return repository.config().then(
                config => config.getStringBuf("remote.origin.url")
            ).then(url => {
                const ownerAndName = url.match(/:(.*)\.git/);
                if (ownerAndName && ownerAndName[1]) {
                    return ownerAndName[1]
                }
                return null;
            });
        })
    );

    const getGeoCodeLocation = function(location) {
        return googleMapsClient.geocode({
            address: location
        }).asPromise().then(response => {
            const results = response.json.results;
            if (results && results.length > 0) {
                return results[0].geometry;
            }
            return null;
        });
    }

    const repoProm = Promise.resolve(repoOwnerAndName).then(ownerAndName => {
        if (ownerAndName && ownerAndName.indexOf("/") !== -1) {
            const [owner, repo] = ownerAndName.split("/");
            console.log(`Getting repo data for ${owner}/${repo} now...`);

            const repoDataProm = octokit.repos.get({
                owner, 
                repo
            }).then(repoDataResponse => {
                const repoData = repoDataResponse.data;
                if (repoData) {
                    const owner = repoData.owner;
                    return octokit.users.getByUsername({
                        username: owner.login
                    }).then(ownerResponse => {
                        const ownerData = ownerResponse.data;
                        if (ownerData && ownerData.location) {
                            return getGeoCodeLocation(ownerData.location).then(geometry => {
                                if (geometry) {
                                    ownerData.geometry = geometry;
                                }
                                return {
                                    repo: repoData,
                                    owner: ownerData
                                };
                            }).catch(err => {
                                console.log(err);
                                console.log(`Had issue checking ${ownerData.login}, falling back to not adding location...`);
                                return {
                                    repo: repoData,
                                    owner: ownerData,
                                };
                            });
                        } else {
                            return {
                                repo: repoData
                            };
                        }
                    })
                }
            });

            const contributorsProm = octokit.repos.listContributors({
                owner,
                repo
            }).then(contributorsResponse => {
                const contributors = contributorsResponse.data;
                if (contributors && contributors.length > 0) {
                    console.log(`Got ${contributors.length} contributors, getting user data now...`);
                    const contributorsDetails = [];
                    contributors.forEach(contributor => {
                        if (contributor && contributor.login) {
                            contributorsDetails.push(
                                octokit.users.getByUsername({
                                    username: contributor.login
                                }).then(userDataResponse => {
                                    const userData = userDataResponse.data;
                                    if (userData && userData.location) {
                                        return getGeoCodeLocation(userData.location).then(geometry => {
                                            if (geometry) {
                                                userData.geometry = geometry;
                                            }
                                            return userData;
                                        }).catch(err => {
                                            console.log(err);
                                            console.log(`Had issue checking ${userData.login}, falling back to not adding location...`);
                                            return userData;
                                        });
                                    } else {
                                        return userData;
                                    }
                                })
                            );
                        }
                    });
                    return Promise.all(contributorsDetails).then(contributorsData => {
                        console.log("Finished fetching user data and locations...");
                        const transformedToMapData = {};
                        (contributorsData || []).forEach(contributor => {
                            transformedToMapData[contributor.login] = contributor;                            
                        });
                        return transformedToMapData;
                    });
                } else {
                    console.error("Repo didn't have contributors...?");
                }
            }).catch(error => {
                console.log(error);
            });

            return Promise.all([repoDataProm, contributorsProm]);
        } else {
            throw "Invalid owner, repo";
        }
    });

    return new Promise((resolve, reject) => {
        Promise.resolve(repoProm).then(data => {
            if (data && data.length == 2) {
                const repoData = data[0];
                const contributors = data[1];

                const stringifiedData = JSON.stringify({
                    repo: repoData.repo,
                    owner: repoData.owner,
                    contributors
                }, null, 2);
                console.log("Writing to src/web/data/userDictionary.json now...");
                fs.writeFile("src/web/data/repo_data.json", stringifiedData, "utf8", resolve);
            } else {
                console.log("Something went wrong with generating data, not writing to file...");
                resolve();
            }
        });
    });
})();

