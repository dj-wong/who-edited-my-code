(function(){
    const fs = require('fs');
    const Git = require("nodegit");
    const octokit = require('@octokit/rest')();
    const gmaps = require('@google/maps');
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GMAPS_API_KEY = process.env.GMAPS_API_KEY;
    const args = process.argv.slice(2);

    console.log(args);

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

    const contributorData = Promise.resolve(repoOwnerAndName).then(ownerAndName => {
        if (ownerAndName && ownerAndName.indexOf("/") !== -1) {
            const [owner, repo] = ownerAndName.split("/");
            console.log(`Getting contributors for ${owner}/${repo} now...`);
            return octokit.repos.listContributors({
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
                                    if (userData.location) {
                                        return googleMapsClient.geocode({
                                            address: userData.location
                                        }).asPromise().then(response => {
                                            const results = response.json.results;
                                            if (results && results.length > 0) {
                                                userData.geometry = results[0].geometry;
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
        } else {
            throw "Invalid owner, repo";
        }
    });

    return new Promise((resolve, reject) => {
        Promise.resolve(contributorData).then(data => {
            if (data) {
                const stringifiedData = JSON.stringify(data, null, 2);
                console.log("Writing to src/web/data/userDictionary.json now...");
                fs.writeFile("src/web/data/userDictionary.json", stringifiedData, "utf8", resolve);
            } else {
                console.log("Something went wrong with generating data, not writing to file...");
                resolve();
            }
        });
    });
})();

