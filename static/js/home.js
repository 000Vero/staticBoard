import PocketBase from "https://cdn.jsdelivr.net/gh/pocketbase/js-sdk@master/dist/pocketbase.es.mjs"

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

for (let board of boards) {
    let preview = pb.files.getURL(board, board.preview, {'token': fileToken});
    console.log(preview)
    boardList.innerHTML += "<li><img src=\"" + preview + "\"><br><a href=\"/board/" + board.id + "\">open board</a>" + "</li>"
}