const Discord = require("discord.js");
const Diagnostics = require("./misc/diagnostics");
const readline = require("readline");
const fs = require("fs");
const firebaseAdmin = require("firebase-admin");
let database;
let databaseValid = false;

class Bot {
	constructor() {
		this.configs = new Map();
		this.changedConfigs = {};
		this._commandMap = new Map();
		this._client = new Discord.Client();
		this._func = new BotFunctions(this);
		this._store = loadStore();

		this._client.on("ready", () => {
			console.log(`Logged in as ${this._client.user.tag}!`);
			this._func.takeInput();
		});
		
		this._client.on("message", msg => {
			this._func.processMessage(msg);
		});
		process
			.on("SIGTERM", () => this.exit())
			.on("SIGINT", () => this.exit())
			.on("uncaughtException", (error) => this.exit(error));
	}

	login() {
		this._client.login(process.env.TOKEN)
			.catch((error) => {
				console.error(error);
				Diagnostics.diagnoseLogin(this._client, error.message);
				
			});
	}

	exit(error) {
		if (error) {
			console.log(error);
		}

		if (this._client) {
			this._client.destroy();
		}
		
		if (databaseValid && this.changedConfigs) {
			const writeBatch = database.batch();
			for (const server of Object.entries(this.changedConfigs)) {
				writeBatch.set(database.doc("servers/"+server[0]), server[1], {merge: true});
			}
			writeBatch.commit().then(() => {
				process.exit(0);
			});
		}
	}

	getConfig(name, guildId) {
		const server = this.getServer(guildId);
		if (server[name] === undefined) {
			const config = this.configs.get(name);
			return config === undefined ? undefined: config.default;
		}

		return server[name];
	}

	registerPlugin(title, names, plugin, configObject) {
		if (!Array.isArray(names)) {
			names = [names];
		}

		const command = {
			title: title,
			names: names,
			plugin: plugin
		};
		for (const name of names) {
			this._commandMap.set(name, command);
		}

		if (configObject) {
			this.configs.set(names[0], configObject);
		}
	}

	getServer(guildId, init) {
		const server = this._store.servers[guildId];
		if (server === undefined) {
			return init ? this._store.servers[guildId] = {} : {};
		}
		return server;
	}
}

class BotFunctions {
	constructor(bot) {
		this.bot = bot;
		this.loadPlugins();
	}

	loadPlugins() {
		const files = fs.readdirSync("src/plugins");
		for (let file of files) {
			file = file.substring(0, file.lastIndexOf("."));
			const Plugin = require("./plugins/" + file + ".js");
			new Plugin(this.bot);
		}
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
					resolve(answer);
				});
			});
		}
		reader.close();
		this.bot.exit();
	}

	async processMessage(msg) {
		if (msg.content.startsWith(".") && msg.content.length > 1) {
			msg.content = msg.content.substring(1);
			this.processCommand(msg);
			return;
		}
	}

	async processCommand(cmd) {
		const parts = cmd.content.split(" ");
		const command = this.bot._commandMap.get(parts[0]);
		if (command === undefined) {
			console.log("Unknown command used: " + cmd);
			return;
		}

		command.plugin.process(cmd, parts);
	}
}


function loadStore() {
	const serviceAccount = require("../acc.json");
	serviceAccount.private_key = process.env.firebase_private_key.replace(/\\n/g, "\n");
	firebaseAdmin.initializeApp({
		credential: firebaseAdmin.credential.cert(serviceAccount),
		databaseURL: "https://hug-bot.firebaseio.com"
	});
	database = firebaseAdmin.firestore();
	const store = {};

	database.collection("servers").get()
		.then(snapshot => {
			store.servers = {};
			snapshot.forEach(doc => {
				store.servers[doc.id] = fixDBvalues(doc.data());
			});
			databaseValid = true;
		})
		.catch(err => {
			console.log("Error getting documents", err);
		});
	return store;
}

function fixDBvalues(string) {
	switch (string) {
	case "true":
		return true;
	case "false":
		return false;	
	}
	return string;
}

module.exports = Bot;