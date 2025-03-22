import { Path } from "../paper.js"

var lineTool = new paper.Tool();
lineTool.color = "#ffffff";
lineTool.thickness = 2;

lineTool.onMouseDown = function(object) {
    this.startingPoint = object.tool._point;
}

lineTool.onMouseDrag = function(object) {
    if (this.path != null) this.path.remove();
    this.path = new Path.Line(this.startingPoint, object.tool._point);
    this.path.strokeColor = this.color;
    this.path.strokeWidth = this.thickness;
}

lineTool.onMouseUp = function() {
    this.path = null;

    console.log(paper.project.activeLayer.exportJSON());
}

export var lineTool;