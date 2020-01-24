// @ts-check

const fetch = require("node-fetch");  // to make linter works

const cache = require("./_cache");

const CTX = "http://3g.dxy.cn/newh5/view/pneumonia";

async function sourceHTML() {
  if(cache.has("html")) {
    return cache.get("html");
  }

  const html = await (fetch(CTX).then(res => res.text()));
  cache.add("html", html, 5 * 60 * 1000);

  return html;
}

module.exports = sourceHTML;
