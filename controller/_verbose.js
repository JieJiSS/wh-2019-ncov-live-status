const ENABLED = process.argv.includes("--verb");

function verbose() {
  if(ENABLED) {
    console.log.apply(null, ["[VERB]"].concat(...arguments));
  }
}

module.exports = verbose;
