// @ts-check

const fetch = require("node-fetch");

const cache = require("./_cache");

const CTX = "http://3g.dxy.cn/newh5/view/pneumonia";

let fetching = false;

async function sourceHTML() {
  if(cache.has("html")) {
    return cache.get("html");
  }

  if(fetching) {
    // avoid fetching repeatedly.
    while(fetching) {
      await sleep(50);
    }
    return cache.get("html");
  }

  let html;
  try {
    fetching = true;
    html = await (fetch(CTX, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
        "Cookie": "route=9305349c5ef09a0f85ffb86b4d77b5f5; JUTE_SESSION_ID=a379fee4-115e-4782-8ed4-964f60b9eb6a; DXY_USER_GROUP=93; JUTE_TOKEN=118797dd-8d56-4332-80a4-e83a010a210b; JSESSIONID=899D36324407C36BB74A0913CD20CAEA; route_bbs=4b7df70fe96acfe89c32b68456fd2ed3; JUTE_SESSION=575691fc08c0f464663f21a6a8ecfd97093fdad9e0ca37d45990903871863325213683c937b19fb6"
      },
      timeout: 15000,
    }).then(res => res.text()));
    if(html) {
      cache.add("html", html, 20 * 60 * 1000);
      fetching = false;
    }
  } catch (err) {
    if(err.name !== "FetchError") {
      console.error("_source.js failed:", err.name, err.message, err.stack);
    };
  }

  return html || await sourceHTML();
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

module.exports = sourceHTML;
