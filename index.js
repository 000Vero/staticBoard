import express from "express";

const app = express()
const port = 5000

app.set("view engine", "ejs");

app.set("views", "./views");

app.use(express.static("./static"));

app.use(express.json());

app.get("/", (req, res) => {
  res.render("home");
})

app.get("/login", (req, res) => {
  res.render("login");
})

app.get("/logout", (req, res) => {
  res.render("logout");
});

app.get("/oauth2-redirect", (req, res) => {
  res.render("oauth2-redirect");
})

app.get("/board/:id", (req, res) => {
  res.render("board");
})

app.listen(port)