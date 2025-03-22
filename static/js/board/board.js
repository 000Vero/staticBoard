import PocketBase from "https://cdn.jsdelivr.net/gh/pocketbase/js-sdk@master/dist/pocketbase.es.mjs"

const id = window.location.pathname.replace("/board/", "");
const pb = new PocketBase("http://127.0.0.1:8090");

export async function getBoardData() {
    let data;
    try {
        data = await pb.collection("boards").getOne(id);
    } catch {
        window.location = "/";
    }
    return data;
}