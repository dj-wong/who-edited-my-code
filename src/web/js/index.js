const grafo = [
    {
        "id": "List",
        "parentIds": ["Object", "Collection"]
    },
    {
        "id": "Object",
        "parentIds": []
    },
    {
        "id": "Collection",
        "parentIds": ["Object"]
    },
    {
        "id": "ArrayList",
        "parentIds": ["List", "Object", "Collection"]
    },
    {
        "id": "LinkedList",
        "parentIds": ["List", "Collection", "Object"]
    },
    {
        "id": "Map",
        "parentIds": ["Object"]
    },
    {
        "id": "AbstractMap",
        "parentIds": ["Map"]
    },
    {
        "id": "HashMap",
        "parentIds": ["AbstractMap"]
    }
]

const dag = d3.dratify()(grafo)
const duration = 750;

d3.sugiyama()(dag);

const links = dag.links()
const descendants = dag.descendants();

var margin = { top: 40, right: 90, bottom: 30, left: 90 }
var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 80; // hard code navbar here...

const svgSelection = d3.select('svg')
    .attr("width", windowWidth)
    .attr("height", windowHeight)
    .append("g")
    .attr("transform", "translate("
    + margin.left + "," + margin.top + ")");;

var width = windowWidth - margin.right - margin.left;
var height = windowHeight - margin.bottom - margin.top;

const line = d3.line()
    .curve(d3.curveCatmullRom)
    .x(d => d.x * width)
    .y(d => d.y * height);

const g = svgSelection.append('g')

g.append('g')
    .selectAll('path')
    .data(links)
    .enter()
    .append('path')
    .attr('d', ({
        source,
        target,
        data
    }) =>
        line([{
            x: source.x,
            y: source.y
        }].concat(
            data.points || [], [{
                x: target.x,
                y: target.y
            }])))
    .attr('fill', 'none')
    .attr('stroke', 'black')

const nodes = g.append('g')
    .selectAll('g')
    .data(descendants)
    .enter()
    .append('g')
    .attr('transform', ({
        x,
        y
    }) => `translate(${x * width}, ${y * height})`)
    .on("click", click);

nodes.append('ellipse')
    .attr('rx', 50)
    .attr('ry', 20)
    .attr('fill', 'white')
    .attr('stroke', 'black');

// Add text, which screws up measureement
nodes.append('text')
    .text(d => d.id)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle');


// Toggle children on click.
function click(d) {
    console.log(d);
    $myModal = $("#myModal");
    $myModal.find(".modal-title").html(d.id);
    // updateGoogleMaps(d);
    $myModal.modal("show");
}
