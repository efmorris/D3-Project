chart("data.csv", "orange");
var datearray = [];
var colorrange = [];

function chart(csvpath, color) {
    if (color == "blue") {
        colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
    }
    else if (color == "pink") {
        colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
    }
    else if (color == "orange") {
        colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
    }

    strokecolor = colorrange[0];

    var format = d3.time.format("%m/%d/%y");
    var margin = {top: 20, right: 40, bottom: 45, left: 55};
    var width = document.body.clientWidth - margin.left - margin.right;
    var height = 450 - margin.top - margin.bottom;
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "20") // z-index or "bring-to-top"
        .style("visibility", "visible") //"visible" was originally "hidden"
        .style("top", "75px") //height of tooltip
        .style("left", "100px");
    
    var x = d3.time.scale()
        .range([0, width]);
    var y = d3.scale.linear()
        .range([height-10, 0]);
    var z = d3.scale.ordinal()
        .range(colorrange);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.years);
    var yAxis = d3.svg.axis()
        .scale(y);
    var yAxisr = d3.svg.axis()
        .scale(y);
    
    var stack = d3.layout.stack()
        .offset("silhouette")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.value; });
    
    var nest = d3.nest()
        .key(function(d) { return d.key; });
    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return x(d.date); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });
    var svg = d3.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var graph = d3.csv(csvpath, function(data) {
        data.forEach(function(d) {
            d.date = format.parse(d.date);
            d.value = +d.value;
        });

        var layers = stack(nest.entries(data));
        
        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
        
        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", function(d) { return area(d.values); })
            .style("fill", function(d, i) { return z(i); });
        
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("y", 40)
            .attr("x", width/2)
            .style("text-anchor", "end")
            .attr("font-size", "16px")
            .text("Years");

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + width + ", 0)")
            .call(yAxis.orient("right"));
        
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis.orient("left"))
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("x", -130)
            .style("text-anchor", "end")
            .attr("font-size", "16px")
            .text("Revenue in Millions of USD");
        
        svg.selectAll(".layer")
            .attr("opacity", 1)
            .on("mouseover", mOver)
            .on("mousemove", mMove)
            .on("mouseout", mOut);
        
        var vertical = d3.select(".chart")
            .append("div")
            .attr("class", "remove")
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "1px")
            .style("height", "405px")
            //Change this variable to adjust the height of the dynamic white line.
            .style("top", "75px")
            .style("bottom", "30px")
            .style("left", "0px")
            .style("background", "#fff");
        
        d3.select(".chart")
            .on("mousemove", function(){
                    mousex = d3.mouse(this);
                    mousex = mousex[0] + 5;
                    vertical.style("left", mousex + "px" )})
            .on("mouseover", function(){
                    mousex = d3.mouse(this);
                    mousex = mousex[0] + 5;
                    vertical.style("left", mousex + "px")});
        });
}


function mOver(d) {
    d3.select(this)
        .transition()
        .duration(300)
        .attr('stroke', 'black')
        .attr('stroke-width', 2.5);
}

function mMove(d){
    mousex = d3.mouse(this);
    mousex = mousex[0];
    var invertedx = x.invert(mousex);
    invertedx = invertedx.getMonth() + invertedx.getDate();
    var selected = (d.values);
    for (var k = 0; k < selected.length; k++) {
        datearray[k] = selected[k].date
        datearray[k] = datearray[k].getYear() + datearray[k].getDate();
    }
    mousedate = datearray.indexOf(invertedx);
    pro = d.values[mousedate].value;
    d3.select(this)
        .attr("stroke", strokecolor)
        .attr("stroke-width", "0.5px"),
        tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "visible");
}

function mOut(d) {
    d3.select(this)
        .transition()
        .duration(300)
        .style('opacity', 1)
        .attr('stroke', 'none')
        tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "visible");
}
