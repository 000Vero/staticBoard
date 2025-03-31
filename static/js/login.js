import PocketBase from "https://cdn.jsdelivr.net/gh/pocketbase/js-sdk@master/dist/pocketbase.es.mjs"

const pb = new PocketBase("https://sbdb.psqsoft.org");
const redirectURL = "https://staticboard.psqsoft.org/oauth2-redirect";
const queryParams = "&prompt=select_account";

const authMethods = await pb.collection("users").listAuthMethods();
const providers = authMethods.oauth2?.providers || [];

const google = providers[0];
const href = google.authURL + redirectURL + queryParams;

document.getElementById("oauth2").href = href;
document.getElementById("oauth2").onclick = function() {
    localStorage.setItem("provider", JSON.stringify(google));
};