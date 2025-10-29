import { startSaveTimeout } from "../canvas.js";
import { pasteTool } from "./paste.js";

var copyTool = new paper.Tool();

var copyBuffer = [];

copyTool.onMouseDown = function() {
    copyBuffer = [];
    document.getElementById("copy").style.display = "none";
    document.getElementById("paste").style.display = "";
}

copyTool.onMouseDrag = function(object) {
    // Select all hits
    let tests = paper.project.activeLayer.hitTestAll(object.tool._point);

    for (let test of tests) {
        if (test != null && test.item != this.path && copyBuffer.indexOf(test.item) == -1) {
            copyBuffer.push(test.item);
            test.item.originalStrokeColor = test.item.strokeColor;
            test.item.strokeColor = "green";
        }
    }
}


copyTool.onMouseUp = function() {    
    pasteTool.activate();
}

export var copyTool, copyBuffer;