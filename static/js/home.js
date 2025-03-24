import PocketBase from "https://cdn.jsdelivr.net/gh/pocketbase/js-sdk@master/dist/pocketbase.es.mjs"
import Swiper from "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs"

/* ===== DATABASE HANDLING ===== */

const pbURL = "http://127.0.0.1:8090";

const pb = new PocketBase(pbURL);

pb.authStore.loadFromCookie(document.cookie);

let avatarURL;

try {
    avatarURL = pbURL +
                "/api/files/users/" +
                pb.authStore.baseModel.id +
                "/" +
                pb.authStore.baseModel.avatar;
} catch {
    window.location = "/login";
}

document.getElementById("avatar").src = avatarURL;
document.getElementById("name").innerText = pb.authStore.baseModel.name;

const fileToken = await pb.files.getToken();

const boardList = document.getElementById("boardList");

const boards = await pb.collection("boards").getFullList();

/* ===== BOARD LIST RENDERING ===== */

const cardTemplate = `
<div class="card swiper-slide">
    <div class="card-image">
        <figure class="image is-16by9">
            <img
                src="boardPreviewImage"
                alt="Preview image"
            />
        </figure>
    </div>
    <div class="card-content">
        <div class="media">
            <div class="media-content">
                <p class="title is-4">boardName</p>
                <p class="subtitle is-6">boardAuthor</p>
            </div>
        </div>

        <div class="content">
            <a href="boardURL">Open board</a>
            <br>
            Last modified 
            <time>boardModified</time>
        </div>
    </div>
</div>
`;

for (let board of boards) {
    let preview = pb.files.getURL(board, board.preview, {"token": fileToken});
    let author = await pb.collection("users").getOne(board.author);


    let template = cardTemplate.replace("boardURL", "/board/" + board.id);
    template = template.replace("boardPreviewImage", preview);
    template = template.replace("boardName", board.name);
    template = template.replace("boardAuthor", author.name);
    template = template.replace("boardModified", board.updated.split(" ")[0]);
    boardList.innerHTML += template;
}

const swiper = new Swiper(".swiper", {
    // Optional parameters
    direction: "horizontal",
    effect: "coverflow",
    slidesPerView: 2,
    centeredSlides: true,
    loop: false,
  
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
  