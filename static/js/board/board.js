import PocketBase from "https://cdn.jsdelivr.net/gh/pocketbase/js-sdk@master/dist/pocketbase.es.mjs"

export const id = window.location.pathname.replace("/board/", "");
export const pb = new PocketBase("https://sbdb.psqsoft.org");

pb.authStore.loadFromCookie(document.cookie);

export async function getBoardData() {
    let data;
    try {
        data = await pb.collection("boards").getOne(id);
    } catch {
        window.location = "/";
    }
    return data;
}