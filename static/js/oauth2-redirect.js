import PocketBase from "https://cdn.jsdelivr.net/gh/pocketbase/js-sdk@master/dist/pocketbase.es.mjs"

const pb = new PocketBase("https://sbdb.psqsoft.org");
const redirectURL = "https://staticboard.psqsoft.org/oauth2-redirect";
const contentEl = document.getElementById("content");

// parse the query parameters from the redirected url
const params = (new URL(window.location)).searchParams;

// load the previously stored provider's data
const provider = JSON.parse(localStorage.getItem("provider"));

// compare the redirect's state param and the stored provider's one
if (provider.state !== params.get("state")) {
    contentEl.innerText = "State parameters don't match.";
} else {
    // authenticate
    console.log(provider.name)
    console.log(params.get("code"))
    console.log(provider.codeVerifier)
    console.log(redirectURL)
    pb.collection("users").authWithOAuth2(
        provider.name,
        params.get("code"),
        provider.codeVerifier,
        redirectURL,
        {
            emailVisibility: false,
        }

    
    ).then(() => {
        // Set cookie
        const cookie = pb.authStore.exportToCookie({
            httpOnly: false
        });
        document.cookie = cookie;
        // Success, redirect
        window.location = "/";
    }).catch((err) => {
        contentEl.innerText = "Failed to exchange code.\n" + err;
    });
}