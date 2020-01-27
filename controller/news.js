// @ts-check

const formatDistanceToNow = require("date-fns/formatDistanceToNow");

const patients = require("./patients");
const { getStatusByProvId } = patients;
const cache = require("./_cache");
const source = require("./_source");

async function news() {
  if(cache.has("news")) {
    return JSON.parse(cache.get("news"));
  }
  cache.del("patients");
  await patients();  // also update patients cache

  let json = await source.sourceTimelineJSON();
  if(!json.data) {
    json = { data: [] };
  }

  const data = json.data.sort((a, b) => b.pubDate - a.pubDate).slice(0, 25);

  const result = [];
  for(let i = 0; i < data.length; i++) {
    const post = data[i];
    const block = await generateDescription(post);
    result.push(block);
  }

  cache.add("news", JSON.stringify(result), 14 * 60 * 1000);

  return result;
}

async function generateDescription(post) {
  const publishTime = formatDistanceToNow(post.pubDate, { addSuffix: true });
  const status = await getStatusByProvId(post.provinceId) || "";
  if(!status) post.provinceName = "海外内容，无统计数据。";

  let result = `${safeHTML(post.title)}\n${safeHTML(post.infoSource)} published at ${publishTime}`;
  result += `\n\n${safeHTML(post.summary)}\n\n相关信息：${safeHTML(post.provinceName)} `;
  result += `${safeHTML(status)}\n内容来源：${generateLink(post.sourceUrl)}`;

  return result;
}

function generateLink(url) {
  // remove duplicate links
  const links = Array.from(new Set(url.trim().split(/[\n\u200b]/).map(u => u.trim())));
  let result = "";
  for(let i = 0; i < links.length; i++) {
    const link = links[i];
    result += `<a href="${encodeURI(link)}" target="_blank">${safeHTML(link)}</a>\n`;
  }
  return result.trim();
}

function safeHTML(text) {
  return text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;");
}

module.exports = news;
