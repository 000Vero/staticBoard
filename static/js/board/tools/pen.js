import { Path } from "../paper.js"
import { currentColor, currentThickness, startSaveTimeout } from "../canvas.js";

var penTool = new paper.Tool();

penTool.onMouseDown = function(object) {
    this.path = new Path(object.tool._point);
    this.path.strokeColor = currentColor;
    this.path.strokeWidth = currentThickness;
}

penTool.onMouseDrag = function(object) {
    this.path.add(object.tool._point);
}

penTool.onMouseUp = function() {
    this.path.simplify(10);

    if (this.path._segments.length == 1) this.path.remove();

    startSaveTimeout();
}

export var penTool;