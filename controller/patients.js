// @ts-check

const cheerio = require("cheerio");

const cache = require("./_cache");
const source = require("./_source");

// const REGEX = {
//   "confirmed": /确诊\s*(\d+)\s*例/,
//   "cured": /治愈\s*(\d+)\s*例/,
//   "dead": /死亡\s*(\d+)\s*例/,
//   "suspect": /疑似\s*(\d+)\s*例/,
// };

let cityData = [], provData = [];
let cityText = "[]", provText = "[]";

async function patients() {
  if(cache.has("patients")) {
    return JSON.parse(cache.get("patients"));
  }

  await updateData();

  const result = [];
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
    })
  }

  cache.add("patients", JSON.stringify(result), (19 * 60 + 10) * 1000);

  return result;
}

async function updateData() {
  const html = await source();
  const $ = cheerio.load(html); // 

  const provJsonText = $("#getListByCountryTypeService1").html()
    .trim().replace("try { window.getListByCountryTypeService1 = ", "").replace("}catch(e){}", "");
  const cityJsonText = $("#getAreaStat").html()
    .trim().replace("try { window.getAreaStat = ", "").replace("}catch(e){}", "");
  
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

patients.getStatusByProvId = getStatusByProvId;
patients.updateData = updateData;

function generateDescription(obj) {
  return `确诊 ${obj.confirmedCount} 例，疑似 ${obj.suspectedCount} 例，` +
    `治愈 ${obj.curedCount} 例，死亡 ${obj.deadCount} 例。`;
}

module.exports = patients;
