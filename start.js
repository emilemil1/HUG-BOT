//flags
const i = process.argv.indexOf("-t");
process.env.TOKEN = i === -1 ? process.env.TOKEN : process.argv[i + 1];

//run
const Bot = require("./src/bot");
const bot = new Bot();
bot.login();