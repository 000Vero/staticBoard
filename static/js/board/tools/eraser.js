import { Path, Point } from "../paper.js"

var eraserTool = new paper.Tool();

eraserTool.onMouseMove = function(object) {
    if (this.path != null) this.path.remove();

    this.path = new Path.Rectangle(new Point(object.tool._point.x - 10, object.tool._point.y - 10), new Point(object.tool._point.x + 10, object.tool._point.y + 10));
    this.path.strokeColor = "white";
    this.path.strokeWidth = 1;
}

eraserTool.onMouseDown = function(object) {
    let tests = paper.project.activeLayer.hitTestAll(object.tool._point);

    for (let test of tests) {
        if (test != null && test.item != this.path) test.item.remove();
    }
}

eraserTool.onMouseDrag = function(object) {
    if (this.path != null) this.path.remove();

    this.path = new Path.Rectangle(new Point(object.tool._point.x - 10, object.tool._point.y - 10), new Point(object.tool._point.x + 10, object.tool._point.y + 10));
    this.path.strokeColor = "white";
    this.path.strokeWidth = 1;

    let tests = paper.project.activeLayer.hitTestAll(object.tool._point);
    for (let test of tests) {
        if (test != null && test.item != this.path) test.item.remove();
    }
}

eraserTool.onMouseUp = function() {
}

export var eraserTool;