const ENABLED = process.argv.includes("--verb");

function verbose() {
  const timeStr = new Date().toLocaleTimeString(void 0, {
    timeZone: "Asia/Shanghai",
    hour12: false,
  }) + " (+8):";
  if(ENABLED) {
    console.log.apply(null, ["[VERB]", timeStr].concat(...arguments));
  }
}

module.exports = verbose;
