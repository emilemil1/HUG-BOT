const fs = require("fs");

//init
if (!fs.existsSync("botconfig.json")) {
	console.log("Missing configuration file: 'botconfig.json'");
	process.exit(0);
}
let botConfig = JSON.parse(fs.readFileSync("botconfig.json"));

if (process.env.discordToken) {
	botConfig.discordToken = process.env.discordToken;
}
if (process.env.databasePrivateKey) {
	botConfig.databasePrivateKey = process.env.databasePrivateKey;
}

if (fs.existsSync("botsecrets.json")) {
	botConfig = {
		...botConfig,
		...JSON.parse(fs.readFileSync("botsecrets.json"))
	};
}

//flags
const i = process.argv.indexOf("-t");
botConfig.discordToken = i === -1 ? botConfig.discordToken : process.argv[i + 1];
const d = process.argv.indexOf("-d");
botConfig.databasePrivateKey = d === -1 ? botConfig.databasePrivateKey : process.argv[d + 1];

//run
const Bot = require("./out/bot");
new Bot(botConfig);