import { Path } from "../paper.js"

var penTool = new paper.Tool();
penTool.color = "#ffffff";
penTool.thickness = 4;

penTool.onMouseDown = function(object) {
    this.path = new Path(object.tool._point);
    this.path.strokeColor = this.color;
    this.path.strokeWidth = this.thickness;
}

penTool.onMouseDrag = function(object) {
    this.path.add(object.tool._point);
}

penTool.onMouseUp = function() {
    this.path.simplify(10);

    if (this.path._segments.length == 1) this.path.remove();

    console.log(paper.project.activeLayer.exportJSON());
}

export var penTool;