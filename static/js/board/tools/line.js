import { currentColor, currentThickness, startSaveTimeout } from "../canvas.js";
import { Path } from "../paper.js"

var lineTool = new paper.Tool();

lineTool.onMouseDown = function(object) {
    this.startingPoint = object.tool._point;
}

lineTool.onMouseDrag = function(object) {
    if (this.path != null) this.path.remove();
    this.path = new Path.Line(this.startingPoint, object.tool._point);
    this.path.strokeColor = currentColor;
    this.path.strokeWidth = currentThickness;
}

lineTool.onMouseUp = function() {
    this.path = null;

    startSaveTimeout();
}

export var lineTool;