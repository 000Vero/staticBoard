import { Point, Size } from "./paper.js"
import { getBoardData } from "./board.js"
import { penTool } from "./tools/pen.js"
import { lineTool } from "./tools/line.js"
import { rectangleTool } from "./tools/rect.js"
import { circleTool } from "./tools/circle.js"
import { eraserTool } from "./tools/eraser.js"
import { pb, id } from "./board.js"

var saveTimeout;
const saveDelay = 5000;
var currentLayer = 0;

window.onload = async function() {
    var canvas = document.getElementById("board");
    paper.setup(canvas);
    dynamicResize(window.innerWidth, window.innerHeight);

    var data = await getBoardData();
    document.title = data.name;
    try {
        paper.project.importJSON(data.data);
        switchLayer(currentLayer);
    } catch {
        // What to do if JSON import fails
        console.log("failed")
    }

    if (data.author != pb.authStore.baseModel.id) {
        document.getElementById("progressBar").style.display = "none";
        document.getElementById("currentLayer").style.visibility = "visible";
        document.getElementById("tools").style.display = "none";
        penTool.remove();
        document.getElementById("container").style.display = "flex";
        return;
    }

    paper.settings.hitTolerance = 20;

    penTool.activate();

    setupElements();

    document.getElementById("progressBar").style.display = "none";
    document.getElementById("currentLayer").style.visibility = "visible";
    document.getElementById("container").style.display = "flex";
    document.getElementById("tools").style.visibility = "visible";
}

window.onresize = function() {
    dynamicResize(window.innerWidth, window.innerHeight);
}

function dynamicResize(windowWidth, windowHeight) {
    const widthRatio = 16/9;
    const heightRatio = 9/16;
    const multiplier = 0.9;
    const baseWidth = 1920;
    const baseHeight = 1080;

    windowHeight -= document.getElementById("tools").getBoundingClientRect().height + 10;

    let width = windowHeight * widthRatio * multiplier;
    let height = windowHeight * multiplier;

    if (width > windowWidth) {
        width = windowWidth * multiplier;
        height = windowWidth * multiplier * heightRatio;
    }

    paper.view.viewSize = new Size(width, height);

    paper.view.scaling = new Point(width / baseWidth, height / baseHeight);

    paper.view.center = new Point(baseWidth / 2, baseHeight / 2);
}

export function startSaveTimeout() {
    if (saveTimeout != null) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(save, saveDelay);
}

async function save() {
    if (eraserTool.path != null) {
        eraserTool.path.remove();
    }

    let exported = paper.project.exportJSON();
    
    let body = {
        data: exported
    };

    // Fix eraser is visible in preview

    if (currentLayer == 0) {
        const canvas = document.getElementById("board");
        const imgData = await (await fetch(canvas.toDataURL("image/png"))).blob();
        const imgFile = new File(
            [imgData],
            "preview.png",
            {
                type: "image/png"
            }
        );
        body.preview = imgFile;
    }

    await pb.collection("boards").update(id, body);
};

function setupElements() {
    document.getElementById("pen").onclick = function() {
        penTool.activate();
        if (eraserTool.path != null) eraserTool.path.remove();
    };
    document.getElementById("line").onclick = function() {
        lineTool.activate();
        if (eraserTool.path != null) eraserTool.path.remove();
    };
    document.getElementById("rect").onclick = function() {
        rectangleTool.activate();
        if (eraserTool.path != null) eraserTool.path.remove();
    };
    document.getElementById("circle").onclick = function() {
        circleTool.activate();
        if (eraserTool.path != null) eraserTool.path.remove();
    };
    document.getElementById("eraser").onclick = function() { eraserTool.activate(); };

    document.getElementById("share").onclick = function() {  };

    document.getElementById("save").onclick = save;

    document.getElementById("previous").onclick = function() {
        console.log(paper.project.layers)
        if (currentLayer > 0) currentLayer--;
        switchLayer(currentLayer);
    };

    document.getElementById("next").onclick = function() {
        if (currentLayer < 19) currentLayer++;
        switchLayer(currentLayer);
    };
}

function switchLayer(index) {
    paper.project.activeLayer.visible = false;
    try {
        paper.project.layers[index].activate();
    } catch {
        paper.project.layers[index] = new paper.Layer();
    }
    paper.project.activeLayer.visible = true;
    document.getElementById("currentLayer").innerText = currentLayer + 1;
}