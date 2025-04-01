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
var data;
export var currentColor = "white";
export var currentThickness = 4;

/* ===== INITIAL SETUP ===== */

window.onload = async function() {
    var canvas = document.getElementById("board");
    paper.setup(canvas);
    dynamicResize(window.innerWidth, window.innerHeight);

    data = await getBoardData();
    document.title = data.name;
    try {
        paper.project.importJSON(data.data);
        for (let lr of paper.project.layers) lr.visible = false;
        switchLayer(currentLayer);
    } catch {
        // What to do if JSON import fails
        console.log("failed")
    }

    document.getElementById("previous").onclick = function() {
        console.log(paper.project.layers)
        if (currentLayer > 0) currentLayer--;
        switchLayer(currentLayer);
    };

    document.getElementById("next").onclick = function() {
        if (currentLayer < 19) currentLayer++;
        switchLayer(currentLayer);
    };

    if (data.author != pb.authStore.baseModel.id) {
        document.getElementById("progressBar").style.display = "none";
        document.getElementById("currentLayer").style.visibility = "visible";
        document.getElementById("tools").style.visibility = "visible";

        let elems = document.getElementsByClassName("edit");
        for (let el of elems) el.style.display = "none";

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

/* ===== CANVAS SCALING ===== */

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

/* ===== SAVE HANDLING ===== */

export function startSaveTimeout() {
    if (saveTimeout != null) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(save, saveDelay);
}

var offline = false;

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

    let indicator = document.getElementById("connected").classList;

    try {
        await pb.collection("boards").update(id, body);
    } catch {
        offline = true;
        indicator.remove("fa-wifi");
        indicator.add("fa-plane-up");
        return;
    }
    if (offline) {
        indicator.add("fa-wifi");
        indicator.remove("fa-plane-up");
        offline = false;
    }
};

/* ===== ELEMENTS SETUP ===== */

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

    document.getElementById("color").onclick = function() {
        document.getElementById("colorModal").classList.add("is-active");
    };

    document.getElementById("closeColor").onclick = function() {
        document.getElementById("colorModal").classList.remove("is-active");
    };

    document.getElementById("closeSharing").onclick = function() {
        document.getElementById("sharingModal").classList.remove("is-active");
    };

    let modalBgs = document.getElementsByClassName("modal-background");
    for (let bg of modalBgs) bg.onclick = function(event) {
        event.target.parentNode.classList.remove("is-active");
    };

    document.getElementById("share").onclick = openSharingModal;

    document.getElementById("shareBtn").onclick = shareBoardWithUser;

    document.getElementById("save").onclick = save;

    document.getElementById("connected").style.visibility = "visible";
}

/* ===== LAYER SWITCHING ===== */

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

/* ===== COLOR HANDLING ===== */

var colorPicker = new iro.ColorPicker('#picker', {
    borderWidth: 2,
    layout: [
        {
            component: iro.ui.Wheel,
            options: {
                borderColor: "white"
            }
        },
        {
            component: iro.ui.Slider,
            options: {
                borderColor: "white"
            }
        }
    ]
});
  

colorPicker.on("color:change", function(color) {
    currentColor = color.hexString;
    updateToolsColor(currentColor);
});

let colors = document.getElementsByClassName("color");

for (let color of colors) {
    color.onclick = function() {
        currentColor = color.style.color;
        updateToolsColor(currentColor);
    }
}

function updateToolsColor(color) {
    document.getElementById("pen").style.color = color;
    document.getElementById("line").style.color = color;
    document.getElementById("rect").style.color = color;
    document.getElementById("circle").style.color = color;
    document.getElementById("color").style.color = color;

    let boardStyle = document.getElementById("board").style;
    boardStyle.borderColor = color;
    boardStyle.boxShadow = color + " 0px 0px 1vw";
}

/* ===== THICKNESS HANDLING ===== */
document.getElementById("thicknessRange").oninput = function(event) {
    currentThickness = document.getElementById("thicknessRange").value;
    document.getElementById("thickness").innerText = "Thickness: " + currentThickness;
}

/* ===== SHARING HANDLING ===== */

async function openSharingModal() {
    let readers = data.readers;
    let groupReaders = data.groupReaders;
    let readersList = document.getElementById("readersList").children[0].children[1];
    if (readers.length > 0 || groupReaders.length > 0) readersList.innerHTML = "";
    else {
        readersList.innerHTML = "<tr><td>No one</td></tr>";
    }
    
    const readerTemplate = `
    <tr>
        <td>
            injectName<i class="fas fa-times removeReader" style="margin-left: 5px; color: red;" id="injectId"></i>
        </td>
    </tr>
    `;
    for (let reader of readers) {
        let template = readerTemplate.replace("injectId", reader);
        let user = await pb.collection("users").getOne(reader);
        template = template.replace("injectName", user.name);

        readersList.innerHTML += template;
    }

    for (let greader of groupReaders) {
        let template = readerTemplate.replace("injectId", greader);
        let group = await pb.collection("groups").getOne(greader);
        template = template.replace("injectName", group.name);
        template = template.replace("removeReader", "removeGroup");

        readersList.innerHTML += template;
    }

    let removeReaders = document.getElementsByClassName("removeReader");
    for (let removeReader of removeReaders) removeReader.onclick = removeReaderUser;

    let removeGroups = document.getElementsByClassName("removeGroup");
    for (let removeGroup of removeGroups) removeGroup.onclick = removeReaderGroup;
    
    if (!document.getElementById("sharingModal").classList.contains("is-active")) document.getElementById("sharingModal").classList.add("is-active");
}

async function removeReaderUser(event) {
    let dataCopy = Object.assign({}, data);
    dataCopy.readers.pop(dataCopy.readers.indexOf(event.target.id));
    
    try {
        await pb.collection("boards").update(data.id, {
            "readers": data.readers
        });
    } catch {
        return;
    }

    data.readers.pop(data.readers.indexOf(event.target.id));
    openSharingModal();
}

async function removeReaderGroup(event) {
    let dataCopy = Object.assign({}, data);
    dataCopy.groupReaders.pop(dataCopy.groupReaders.indexOf(event.target.id));
    
    try {
        await pb.collection("boards").update(data.id, {
            "groupReaders": data.groupReaders
        });
    } catch {
        return;
    }

    data.groupReaders.pop(data.groupReaders.indexOf(event.target.id));
    openSharingModal();
}

async function shareBoardWithUser() {
    let email = document.getElementById("userSharingEmail").value;
    if (email == "" || email == null) return;
    
    try {
        let dataCopy = Object.assign({}, data);
        if (email.indexOf("@") > -1) {
            let user = await pb.collection("users").getFullList({
                "email": email
            });
            user = user[0].id;
    
            if (data.readers.indexOf(user) > -1) return;
    
            dataCopy.readers.push(user);
    
            await pb.collection("boards").update(data.id, {
                "readers": data.readers
            });
        } else {
            let group = await pb.collection("groups").getFullList({
                "filter": "name=\"" + email + "\""
            });

            if (data.groupReaders.indexOf(group[0].id) > -1) return;

            dataCopy.groupReaders.push(group[0].id);

            await pb.collection("boards").update(data.id, {
                "groupReaders": data.groupReaders
            });
        }
        
    } catch {
        return;
    }

    openSharingModal();
}