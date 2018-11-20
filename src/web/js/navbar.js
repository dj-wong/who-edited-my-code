(function() {
    WhoEditedMyCode.getNavBar = function() {
        return {
            updateRepoName: function() {
                return Promise.resolve(WhoEditedMyCode.getRepoData()).then(({repo}) => {
                    $navBarRepoLink = $(".navbar-text.repo-link").attr("href", repo.html_url);
                    $navBarRepoLink.find("span.repo-name").html(repo.full_name);
                });
            }
        }
    }

    WhoEditedMyCode.getNavBar().updateRepoName();
})()