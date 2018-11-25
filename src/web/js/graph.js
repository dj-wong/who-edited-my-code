(function () {
    const graphviz = d3.select(".svg-container").graphviz();
    const graphData = WhoEditedMyCode.getClassGraphData();
    const t = d3.transition()
        .duration(750)
        .ease(d3.easeLinear);

    const onNodeClick = node => {
        if (node) {
            console.log(`Clicked node: ${node.key}`);
            modal = WhoEditedMyCode.getModal();
            modal.openModal(node.key);
        }
    }

    WhoEditedMyCode.getGraph = () => {
        return {
            renderGraph: function () {
                return Promise.resolve(graphData).then(data => {
                    const windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                    const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 80; // hard code navbar here...
                    const width = windowWidth;
                    const height = windowHeight;

                    return new Promise((resolve, reject) => {
                        graphviz
                            .width(width)
                            .height(height)
                            .fit(true)
                            .engine("circo")
                            .transition(t)
                            .renderDot(data)
                            .on("end", () => {
                                nodes = d3.selectAll(".node")
                                nodes.on("click", onNodeClick);
                                $(d3.select("svg").node()).find(".graph title:first").html("");
                                resolve();
                            });
                    });
                });
            },
            resetZoom: function () {
                graphviz.resetZoom(t);
            }
        };
    }

    const renderGraphFn = WhoEditedMyCode.getGraph().renderGraph
    renderGraphFn();
    window.addEventListener("resize", renderGraphFn);
})()