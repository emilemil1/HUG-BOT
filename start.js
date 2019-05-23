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

if (process.env.imgurAccessToken) {
	botConfig.imgurAccessToken = process.env.imgurAccessToken;
}

if (fs.existsSync("botsecrets.json")) {
	botConfig = {
		...botConfig,
		...JSON.parse(fs.readFileSync("botsecrets.json"))
	};
}

//flags
const dt = process.argv.indexOf("-dt");
botConfig.discordToken = dt === -1 ? botConfig.discordToken : process.argv[dt + 1];
const dpk = process.argv.indexOf("-dpk");
botConfig.databasePrivateKey = dpk === -1 ? botConfig.databasePrivateKey : process.argv[dpk + 1];
const iat = process.argv.indexOf("-iat");
botConfig.databasePrivateKey = iat === -1 ? botConfig.databasePrivateKey : process.argv[iat + 1];


//run
const Bot = require("./out/bot");
new Bot(botConfig);