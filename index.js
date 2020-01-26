const express = require("express");
const fs = require("fs");
const path = require("path");
const { promisify }= require("util");

const readFile = promisify(fs.readFile);

const config = require("./config.json");
const patients = require("./controller/patients");
const news = require("./controller/news");

const app = express();

console.log("pid:", process.pid);

app.get("/", async (_, res) => {
  res.set("Content-Type", "text/html");
  res.send(
    (await readFile(path.resolve(path.join(__dirname, "view", "index.html"))))
    .toString().replace("&ak=", `&ak=${config.ak}`)
  );
});

app.get("/view/assets/perCity.js", async (_, res) => {
  res.set("Content-Type", "application/javascript");
  res.send(await readFile(path.resolve(path.join(__dirname, "view", "assets", "perCity.js"))));
});

app.get("/view/assets/perProv.js", async (_, res) => {
  res.set("Content-Type", "application/javascript");
  res.send(await readFile(path.resolve(path.join(__dirname, "view", "assets", "perProv.js"))));
});

app.get("/api/news", async (_, res) => {
  res.set("Content-Type", "application/json");
  res.send(await news());
});

app.get("/api/news-jsonp.js", async (_, res) => {
  res.set("Content-Type", "application/javascript");
  res.send("var allNews = " + JSON.stringify(await news()));
});

app.get("/api/patients", async (_, res) => {
  res.set("Content-Type", "application/json");
  res.send(await patients());
});

app.get("/api/patients-jsonp.js", async (_, res) => {
  res.set("Content-Type", "application/javascript");
  res.send("var rawData = " + JSON.stringify(await patients()));
});

app.listen(3444);
