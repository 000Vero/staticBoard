import { Path } from "../paper.js"

var rectangleTool = new paper.Tool();
rectangleTool.color = "#ffffff";
rectangleTool.thickness = 2;

rectangleTool.onMouseDown = function(object) {
    this.startingPoint = object.tool._point;
}

rectangleTool.onMouseDrag = function(object) {
    if (this.path != null) this.path.remove();
    this.path = new Path.Rectangle(this.startingPoint, object.tool._point);
    this.path.strokeColor = this.color;
    this.path.strokeWidth = this.thickness;
}

rectangleTool.onMouseUp = function() {
    this.path = null;

    console.log(paper.project.activeLayer.exportJSON());
}

export var rectangleTool;