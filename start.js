const fs = require("fs");

//init
if (!fs.existsSync("botconfig.json")) {
	console.log("Missing configuration file: 'botconfig.json'");
	process.exit(0);
}
const botConfig = JSON.parse(fs.readFileSync("botconfig.json"));

//flags
const i = process.argv.indexOf("-t");
botConfig.discordToken = i === -1 ? botConfig.discordToken : process.argv[i + 1];

//run
const Bot = require("./out/bot");
new Bot(botConfig);