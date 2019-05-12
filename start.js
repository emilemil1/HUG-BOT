const fs = require("fs");

//init
let secrets = {};
if (fs.existsSync("secrets.json")) {
	secrets = JSON.parse(fs.readFileSync("secrets.json"));
}

for (const key in secrets) {
	if (process.env[key] === undefined && secrets[key] !== undefined) {
		process.env[key] = secrets[key];
	}
}

//flags
const i = process.argv.indexOf("-t");
process.env.TOKEN = i === -1 ? process.env.TOKEN : process.argv[i + 1];

//run
const Bot = require("./src/bot");
const bot = new Bot();
bot.login();