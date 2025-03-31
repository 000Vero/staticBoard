import { currentColor, currentThickness, startSaveTimeout } from "../canvas.js";
import { Path } from "../paper.js"

var rectangleTool = new paper.Tool();

rectangleTool.onMouseDown = function(object) {
    this.startingPoint = object.tool._point;
}

rectangleTool.onMouseDrag = function(object) {
    if (this.path != null) this.path.remove();
    this.path = new Path.Rectangle(this.startingPoint, object.tool._point);
    this.path.strokeColor = currentColor;
    this.path.strokeWidth = currentThickness;
}

rectangleTool.onMouseUp = function() {
    this.path = null;

    startSaveTimeout();
}

export var rectangleTool;