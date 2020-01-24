// @ts-check

const cheerio = require("cheerio");
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

  const html = await source();
  const $ = cheerio.load(html);

  const jsonText = $("#getTimelineService").html()
    .trim().replace("try { window.getTimelineService = ", "").replace("}catch(e){}", "");
  const data = JSON.parse(jsonText).sort((a, b) => b.pubDate - a.pubDate);

  const result = [];
  for(let i = 0; i < data.length; i++) {
    const post = data[i];
    const block = await generateDescription(post);
    result.push(block);
  }

  cache.add("news", JSON.stringify(result), 3 * 60 * 1000);

  return result;
}

async function generateDescription(post) {
  const publishTime = formatDistanceToNow(post.pubDate, { addSuffix: true });
  const status = await getStatusByProvId(post.provinceId) || "";
  if(!status) post.provinceName = "海外内容，无统计数据。";

  let result = `${post.title}\n${post.infoSource} published at ${publishTime}\n\n${post.summary}`;
  result += `\n\n相关信息：${post.provinceName} ${status}\n内容来源：${post.sourceUrl}`;

  return result;
}

module.exports = news;
