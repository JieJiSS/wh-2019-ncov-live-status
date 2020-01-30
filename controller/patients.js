// @ts-check

const cheerio = require("cheerio");

const cache = require("./_cache");
const source = require("./_source");

const REGEX = {
  "confirmed": /确诊\s*(\d+)\s*例/,
  "cured": /治愈\s*(\d+)\s*例/,
  "dead": /死亡\s*(\d+)\s*例/,
  "suspect": /疑似\s*(\d+)\s*例/,
};

let cityData = [], provData = [], totalData = {};
let cityText = "[]", provText = "[]", totalText = "{}";

async function patients() {
  if(cache.has("patients")) {
    return JSON.parse(cache.get("patients"));
  }

  await updatePatientsData();

  const result = [ totalData ];
  for(let i = 0; i < cityData.length; i++) {
    const citySet = cityData[i];
    for(let j = 0; j < citySet.cities.length; j++) {
      const city = citySet.cities[j];
      result.push({
        type: "city",
        name: city.cityName,
        confirmed: city.confirmedCount,
        cured: city.curedCount,
        dead: city.deadCount,
        suspect: city.suspectedCount,
        _desc: generateDescription(city),
      });
    }
    result.push({
      type: "prov",
      name: citySet.provinceName,
      confirmed: citySet.confirmedCount,
      cured: citySet.curedCount,
      dead: citySet.deadCount,
      suspect: citySet.suspectedCount,
      _desc: generateDescription(citySet),
    });
  }

  cache.add("patients", JSON.stringify(result), (14 * 60 + 10) * 1000);

  return result;
}

async function updatePatientsData() {
  const html = await source.sourceHTML();
  const $ = cheerio.load(html);

  const totalJsonText = $("#getStatisticsService").html()
    .trim().replace("try { window.getStatisticsService = ", "").replace("}catch(e){}", "");
  const provJsonText = $("#getListByCountryTypeService1").html()
    .trim().replace("try { window.getListByCountryTypeService1 = ", "").replace("}catch(e){}", "");
  const cityJsonText = $("#getAreaStat").html()
    .trim().replace("try { window.getAreaStat = ", "").replace("}catch(e){}", "");

  if(totalJsonText !== totalText) {
    const totalDataObj = JSON.parse(totalJsonText);

    totalData = Object.assign({}, {
      type: "ctry",
      name: "总计",
      confirmed: totalDataObj.confirmedCount,
      cured: totalDataObj.curedCount,
      dead: totalDataObj.deadCount,
      suspect: totalDataObj.suspectedCount,
      _desc: generateDescription(totalDataObj),
    });

    totalText = totalJsonText;
  }
  if(provJsonText !== provText) {
    provData = JSON.parse(provJsonText);
    provText = provJsonText;
  }
  if(cityJsonText !== cityText) {
    cityData = JSON.parse(cityJsonText);
    cityText = cityJsonText;
  }
}

async function getStatusByProvId(pid) {
  for(let i = 0; i < provData.length; i++) {
    const prov = provData[i];
    if(pid === prov.provinceId) {
      return generateDescription(prov);
    }
  }
}

function parseRemark(remark) {
  const text = String(remark || "");
  const confirmedArr = text.match(REGEX.confirmed);
  const suspectArr   = text.match(REGEX.suspect  );
  const curedArr     = text.match(REGEX.cured    );
  const deadArr      = text.match(REGEX.dead     );
  const confirmed = Number(confirmedArr[1] || "");
  const suspect   = Number(suspectArr[1]   || "");
  const cured     = Number(curedArr[1]     || "");
  const dead      = Number(deadArr[1]      || "");
  return {
    confirmedCount: confirmed,
    suspectedCount: suspect,
    curedCount:     cured,
    deadCount:      dead,
  };
}

patients.getStatusByProvId = getStatusByProvId;

function generateDescription(obj) {
  const suspectText = obj.suspectedCount ? `疑似 ${obj.suspectedCount} 例，` : "";
  return `确诊 ${obj.confirmedCount} 例，${suspectText}` +
    `治愈 ${obj.curedCount} 例，死亡 ${obj.deadCount} 例。`;
}

module.exports = patients;
