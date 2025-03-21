import PocketBase from "https://cdn.jsdelivr.net/gh/pocketbase/js-sdk@master/dist/pocketbase.es.mjs"

const pb = new PocketBase("http://127.0.0.1:8090");
const redirectURL = "http://127.0.0.1:5000/oauth2-redirect";
const queryParams = "&prompt=select_account";

const authMethods = await pb.collection("users").listAuthMethods();
const providers = authMethods.oauth2?.providers || [];
const listItems = [];

for (const provider of providers) {
    const $li = $(`<li><a>Login with ${provider.name}</a></li>`);

    $li.find("a")
        .attr("href", provider.authURL + redirectURL + queryParams)
        .data("provider", provider)
        .click(function () {
            // store provider's data on click for verification in the redirect page
            localStorage.setItem("provider", JSON.stringify($(this).data("provider")));
        });

    listItems.push($li);
}

$("#list").html(listItems.length ? listItems : "<li>No OAuth2 providers.</li>");