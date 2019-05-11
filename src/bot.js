const Discord = require("discord.js");
const Diagnostics = require("./misc/diagnostics");
const readline = require("readline");
const Server = require("http");

class Bot {
	constructor() {
		this._client = new Discord.Client();
		this._func = new BotFunctions(this);
		this._server = Server.createServer().listen(3000);

		this._client.on("ready", () => {
			console.log(`Logged in as ${this._client.user.tag}!`);
			this._func.takeInput();
		});
		
		this._client.on("message", msg => {
			if (msg.content === "ping") {
				msg.reply("pong");
			}
			if (msg.content === "ripped kicks") {
				msg.channel.send("@B3#9666");
			}
		});
	}

	login() {
		this._client.login(process.env.TOKEN)
			.catch((error) => {
				console.error(error);
				Diagnostics.diagnoseLogin(this._client, error.message);
				
			});
	}

	exit() {
		this._client.destroy();
		this._server.close();
		process.exit(0);
	}
}

class BotFunctions {
	constructor(bot) {
		this.bot = bot;
	}

	async takeInput() {
		const reader = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		let command;
		while (command !== "exit") {
			command = await new Promise((resolve) => {
				reader.question("> ", async answer => {
					this.processInput(answer);
					resolve(answer);
				});
			});
		}
		reader.close();
		this.bot.exit();
	}

	async processInput(input) {
		switch(input) {
		case "hello":
			reply("HI!");
			break;
		}
		return input;
	}
}

function reply(msg) {
	console.log("HUG-BOT: " + msg);
}

module.exports = Bot;