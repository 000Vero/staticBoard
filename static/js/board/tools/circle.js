import { Path } from "../paper.js"

var abs = Math.abs;
var sqrt = Math.sqrt;

var circleTool = new paper.Tool();
circleTool.color = "#ffffff";
circleTool.thickness = 10;

circleTool.onMouseDown = function(object) {
    this.startingPoint = object.tool._point;
}

circleTool.onMouseDrag = function(object) {
    if (this.path != null) this.path.remove();

    let dx = abs(this.startingPoint.x - object.tool._point.x);
    let dy = abs(this.startingPoint.y - object.tool._point.y);

    let radius = sqrt(dx**2 + dy**2);

    this.path = new Path.Circle(this.startingPoint, radius);
    this.path.strokeColor = this.color;
    this.path.strokeWidth = this.thickness;
}

circleTool.onMouseUp = function() {
    this.path = null;

    console.log(paper.project.activeLayer.exportJSON());
}

export var circleTool;