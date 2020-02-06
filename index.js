const express = require("express");
const fs = require("fs");
const path = require("path");
const { promisify }= require("util");

const readFile = promisify(fs.readFile);

const baiduMapConfig = require("./config.json");
const controllerConfig = require("./controller/_config");
const patients = require("./controller/patients");
const news = require("./controller/news");
const source = require("./controller/_source");
const verbose = require("./controller/_verbose");

const app = express();

console.log("pid:", process.pid);


app.all(/^\S*$/, (req, _, next) => {
  const d = new Date();

  const dateStr = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const timeStr = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`

  const tzOffset = d.getTimezoneOffset();
  const sign = tzOffset < 0 ? "+" : '-';
  const tzStr = `(UTC${sign}${-tzOffset / 60})`;

  verbose("--->", req.method, req.url, `at: ${dateStr} ${timeStr} ${tzStr}`);
  next();
});

app.get("/", async (_, res) => {
  res.set("Content-Type", "text/html");
  res.send(
    (await readFile(path.resolve(path.join(__dirname, "view", "index.html"))))
    .toString().replace("&ak=", `&ak=${baiduMapConfig.ak}`)
  );
});

app.get("/assets/perCity.js", async (_, res) => {
  res.set("Content-Type", "application/javascript");
  res.send(await readFile(path.resolve(path.join(__dirname, "view", "assets", "perCity.js"))));
});

app.get("/assets/perProv.js", async (_, res) => {
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

let lastSource = 0;

app.get("/api/_sourceHTML", async (_, res) => {
  const now = Date.now();
  res.set("Content-Type", "application/json");
  if(!controllerConfig.ENABLE_MANUAL_SOURCE) {
    res.send("forbidden");
  } else {
    if(now - lastSource < 60 * 1000) {
      await source.sourceHTML();
      res.send("success");
    } else {
      res.send("too frequent");
    }
  }
});

app.listen(3444);
