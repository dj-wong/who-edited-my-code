(function () {
    const classGraph = new Promise((resolve, reject) => {
        $.get('http://localhost:8080/data/class_graph.txt', data => {
            resolve(data);
        });
    });

    const classData = new Promise((resolve, reject) => {
        $.getJSON('http://localhost:8080/data/class_data.json', json => {
            resolve(json);
        });
    }); 

    const repoData = new Promise((resolve, reject) => {
        $.getJSON('http://localhost:8080/data/repo_data.json', json => {
            resolve(json);
        });
    }); 

    window.WhoEditedMyCode = {
        // Graph "Class", handles Graph lifecycle
        getGraph() {
            console.log("not implemented, something went wrong");  
        },

        // NavBar "Class", handles NavBar lifecycle
        getNavBar:function() {
            console.log("not implemented, something went wrong");
        },

        // Modal "Class", handles Modal lifecycle
        getModal:function() {
            console.log("not implemented, something went wrong");
        },

        // MapController "Class", handles Map lifecycle
        getMapController: function() {
            console.log("not implemented, something went wrong");
        },

        // data getters
        getClassGraphData:function() {
            return classGraph;
        },
        getRepoData:function() {
            return repoData;
        },
        getClassData:function() {
            return classData;
        }


    }
})();