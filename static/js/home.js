import PocketBase from "https://cdn.jsdelivr.net/gh/pocketbase/js-sdk@master/dist/pocketbase.es.mjs"
import Swiper from "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs"

/* ===== DATABASE HANDLING ===== */

const pbURL = "https://sbdb.psqsoft.org";

const pb = new PocketBase(pbURL);

pb.authStore.loadFromCookie(document.cookie);

let avatarURL;

let fileToken;

try {
    avatarURL = pbURL +
                "/api/files/users/" +
                pb.authStore.baseModel.id +
                "/" +
                pb.authStore.baseModel.avatar;
    
    fileToken = await pb.files.getToken();
} catch {
    window.location = "/login";
}

document.getElementById("avatar").src = avatarURL;
document.getElementById("name").innerText = pb.authStore.baseModel.name;

const boards = await pb.collection("boards").getFullList({
    sort: "-updated"
});

/* ===== BOARD LIST RENDERING ===== */

const cardTemplate = `
<div class="card swiper-slide is-shadowless">
    <div class="card-image">
        <a href="boardURL">
            <figure class="image is-16by9">
                <img src="boardPreviewImage" alt="Preview image"/>
            </figure>
        </a>
    </div>
    <div class="card-content">
        <div class="media">
            <div class="media-content">
                <a href="boardURL"><p class="title is-4">boardName</p></a>
                <p class="subtitle is-6">boardAuthor</p>
            </div>
        </div>

        <div class="content">
            Last modified 
            <time>boardModified</time>

            <br><br>

            <button class="button is-outlined is-light deleteBoard" id="boardId">
                Delete board
                <i class="fa-solid fa-trash-can" style="margin-left: 5px;"></i>
            </button>
        </div>
    </div>
</div>
`;

var boardSlides = [];

for (let board of boards) {
    let template = cardTemplate.replaceAll("boardURL", "/board/" + board.id);

    let preview;

    if (board.preview != "") {
        preview = pb.files.getURL(board, board.preview, {"token": fileToken});
        template = template.replace("boardPreviewImage", preview);
    } else {
        template = template.replace('<img src="boardPreviewImage" alt="Preview image"/>', "");
    }

    let author = await pb.collection("users").getOne(board.author);

    template = template.replace("boardName", board.name);
    template = template.replace("boardAuthor", author.name);
    template = template.replace("boardModified", board.updated.split(" ")[0]);
    template = template.replace("boardId", board.id);
    if (pb.authStore.baseModel.id != board.author) {
        template = template.replace('<button class="button is-outlined is-light deleteBoard" id="' + board.id + '">', '<button style="display: none;">');
    }
    boardSlides = boardSlides.concat(template);
    //boardList.innerHTML += template;
}

const swiper = new Swiper(".swiper", {
    // Optional parameters
    direction: "horizontal",
    slidesPerView: 2,
    loop: true,
    freeMode: true,

    keyboard: {
        enabled: true
    },
  
    // If we need pagination
    pagination: {
      el: ".swiper-pagination",
    },
  
    // Navigation arrows
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  
    // And if we need scrollbar
    scrollbar: {
      el: ".swiper-scrollbar",
    },
});

document.getElementById("progressBar").style.display = "none";

swiper.appendSlide(boardSlides);

const slides = Object.assign([], document.getElementById("boardList").children);

/* ===== EVENT HANDLING ===== */

document.getElementById("create").onclick = function() {
    let modal = document.getElementById("createModal");
    modal.classList.add("is-active");
}

document.getElementById("closeCreate").onclick = function() {
    let modal = document.getElementById("createModal");
    modal.classList.remove("is-active");
}

document.getElementById("createBoard").onclick = async function() {
    let name = document.getElementById("newBoardName").value;
    if (name == null || name == "") return;
    if (name.length > 64) name = name.substring(0, 64);

    document.getElementById("createBoard").onclick = null;

    let newBoard = await pb.collection("boards").create({
        name: name,
        author: pb.authStore.baseModel.id
    });

    window.location = "/board/" + newBoard.id;

}

document.getElementById("searchInput").onkeyup = function() {
    const content = document.getElementById("searchInput").value;

    if (content == "awesome") {
        document.body.style.animationName = "rotateHue";
        document.body.style.animationDuration = "1s";
        document.body.style.animationIterationCount = "infinite";
        document.body.style.animationTimingFunction = "linear";
    }

    swiper.removeAllSlides();

    for (let board of slides) {
        let name = board.children[1].children[0].children[0].children[0].innerText;

        if (name.indexOf(content) > -1) {
            swiper.appendSlide(board);
        }
    }
}

let deleteBoardButtons = document.getElementsByClassName("deleteBoard");

for (let deleteBoard of deleteBoardButtons) deleteBoard.onclick = async function(event) {
    let answer = confirm("Are you sure you want to delete this board?");
    if (!answer) return;
    await pb.collection("boards").delete(deleteBoard.id);
    window.location.reload();
}

document.getElementById("avatar").onclick = function(event) {
    let dropdown = event.target.parentNode.parentNode.parentNode;
    if (dropdown.classList.contains("is-active")) dropdown.classList.remove("is-active");
    else dropdown.classList.add("is-active");
}