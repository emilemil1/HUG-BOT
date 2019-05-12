const fs = require("fs");

//init
let secrets = {};
if (fs.existsSync("secrets.json")) {
	secrets = JSON.parse(fs.readFileSync("secrets.json"));
}

if (process.env.TOKEN === undefined && secrets.TOKEN !== undefined) {
	process.env.TOKEN = secrets.TOKEN;
}

//flags
const i = process.argv.indexOf("-t");
process.env.TOKEN = i === -1 ? process.env.TOKEN : process.argv[i + 1];

//run
const Bot = require("./src/bot");
const bot = new Bot();
bot.login();