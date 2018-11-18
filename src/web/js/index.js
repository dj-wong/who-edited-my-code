(function () {
    const graphviz = d3.select(".svg-container").graphviz();
    const t = d3.transition()
        .duration(750)
        .ease(d3.easeLinear);

    const graphData = new Promise((resolve, reject) => {
        jQuery.get('http://localhost:8080/data/class_graph.txt', data => {
            resolve(data);
        });
    });

    function renderGraph() {
        Promise.resolve(graphData).then(data => {
            const windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 80; // hard code navbar here...
            const width = windowWidth;
            const height = windowHeight;

            graphviz
                .width(width)
                .height(height)
                .fit(true)
                .engine("circo")
                .renderDot(data);
        });
    }

    renderGraph();
    window.addEventListener("resize", renderGraph);
})();