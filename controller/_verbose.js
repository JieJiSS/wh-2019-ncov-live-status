const obj2table = require("./_obj2table");

const ENABLED = process.argv.includes("--verb");

function verbose() {
  const timeStr = new Date().toLocaleTimeString(void 0, {
    timeZone: "Asia/Shanghai",
    hour12: false,
  }) + " (+8):";
  if(ENABLED) {
    if(arguments.length === 1 && typeof arguments[0] === "object") {
      console.log(obj2table(arguments[0]));
      return;
    }
    console.log.apply(null, ["[VERB]", timeStr].concat(...arguments));
  }
}

module.exports = verbose;
