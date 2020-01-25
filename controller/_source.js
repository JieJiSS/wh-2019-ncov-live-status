// @ts-check

const fetch = require("node-fetch");

const cache = require("./_cache");

const CTX = "http://3g.dxy.cn/newh5/view/pneumonia";

async function sourceHTML() {
  if(cache.has("html")) {
    return cache.get("html");
  }

  let html;
  try {
    html = await (fetch(CTX, {}).then(res => res.text()));
    cache.add("html", html, 5 * 60 * 1000);
  } catch (err) {
    if(err.name !== "FetchError") {
      console.error("_source.js failed:", err.name, err.message, err.stack);
    };
  }

  return html || await sourceHTML();
}

module.exports = sourceHTML;
