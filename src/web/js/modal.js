(function() {
    const $modal = $("#myModal");
    const repoData = Promise.resolve(WhoEditedMyCode.getRepoData());
    const classData = Promise.resolve(WhoEditedMyCode.getClassData());

    const updateModalTitle = function(title) {
        $modal.find(".modal-title").html(title)
    }

    WhoEditedMyCode.getModal = function() {
        return {
            openModal(title) {
                updateModalTitle(title);
            }
        }
    }

})()