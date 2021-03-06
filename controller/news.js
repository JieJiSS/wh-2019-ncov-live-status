// @ts-check

const cheerio = require("cheerio");

const formatDistanceToNow = require("date-fns/formatDistanceToNow");

const patients = require("./patients");
const { getStatusByProvId } = patients;
const cache = require("./_cache");
const config = require("./_config");
const source = require("./_source");

async function news() {
  if(cache.has("news")) {
    return JSON.parse(cache.get("news"));
  }
  cache.del("patients");
  await patients();  // also update patients cache

  const html = await source.sourceHTML();
  const $ = cheerio.load(html);

  const totalJsonText = $("#getTimelineService").html()
    .trim().replace("try { window.getTimelineService = ", "").replace("}catch(e){}", "");

  let json = JSON.parse(totalJsonText);

  const data = json.sort((a, b) => b.pubDate - a.pubDate).slice(0, 35);

  const result = [];
  for(let i = 0; i < data.length; i++) {
    const post = data[i];
    const block = await generateDescription(post);
    result.push(block);
  }

  cache.add("news", JSON.stringify(result), config.NEWS_CACHE_TTL);

  return result;
}

async function generateDescription(post) {
  const publishTime = formatDistanceToNow(post.pubDate, { addSuffix: true });
  const status = await getStatusByProvId(post.provinceId) || "";
  if(!status) post.provinceName = "综合内容或海外内容，无统计数据。";

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
