import { startSaveTimeout } from "../canvas.js";
import { circleTool } from "./circle.js";
import { copyBuffer } from "./copy.js";
import { penTool } from "./pen.js";

var pasteTool = new paper.Tool();


pasteTool.onMouseDown = function() {
    for (let el of copyBuffer) {
        el.strokeColor = el.originalStrokeColor;
        if (el.parent != paper.project.activeLayer) el.copyTo(paper.project.activeLayer);
        delete el.originalStrokeColor;
    }

    startSaveTimeout();
}

pasteTool.onMouseUp = function () {
    penTool.activate();
    document.getElementById("copy").style.display = "";
    document.getElementById("paste").style.display = "none";
}

export var pasteTool;