const Discord = require("discord.js");
const Diagnostics = require("./misc/diagnostics");
const readline = require("readline");
const fs = require("fs");
const firebaseAdmin = require("firebase-admin");
let database;
let databaseValid = false;
let reader;

class Bot {
	constructor() {
		this.changedConfigs = {};
		this.plugins = new Map();
		this.commands = new Map();
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
			.on("SIGTERM", () => {
				this.exit();
			})
			.on("SIGINT", () => {
				this.exit();
			})
			.on("uncaughtException", (err) => {
				console.log(err);
				this.exit();
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
		if (reader) {
			reader.close();
		}

		if (this._client) {
			this._client.destroy();
		}
		
		if (databaseValid) {
			const writeBatch = database.batch();
			for (const server of Object.entries(this.changedConfigs)) {
				writeBatch.set(database.doc("servers/"+server[0]), server[1], {merge: true});
			}
			writeBatch.commit().then(() => {
				process.exit(0);
			});
		}
	}

	getConfig(name, guildId, def=true) {
		const server = this.getServer(guildId);

		if (server[name]) {
			return server[name];
		}

		if (!def) {
			return undefined;
		}

		const config = this.plugins.get(name).config;
		return config === undefined ? undefined: config.default;
	}

	registerPlugin(plugin) {
		if (plugin.payload) {
			plugin = plugin.payload;
		}
		this.plugins.set(plugin.commands[0], plugin);

		for (const command of plugin.commands) {
			this.commands.set(command, plugin.commands[0]);
		}
		return plugin.payload;
	}

	getServer(guildId, init) {
		const server = this._store.servers[guildId];
		if (server === undefined) {
			return init ? this._store.servers[guildId] = {} : {};
		}
		return server;
	}

	getPluginRoles(plugin, guildId) {
		const customRoles = this.getConfig(plugin.commands[0]+"Roles", guildId, false);
		if (customRoles) {
			return customRoles;
		}
		return plugin.admin ? [] : [guildId];
	}

	verifyRolePermission(cmd, plugin) {
		const allowedRoles = this.getPluginRoles(plugin, cmd.guild.id);
		for (const role of cmd.member.roles) {
			if (allowedRoles.includes(role[1].id)) {
				console.log("allowed");
				return true;
			}
		}

		if (cmd.member.id === cmd.guild.ownerID) {
			console.log("admin override");
			return true;
		}
		return false;
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
		reader = readline.createInterface({
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
			if (command === "SIGTERM") {
				process.kill(process.pid, "SIGTERM");
			}
		}
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
		const command = this.bot.commands.get(parts[0]);
		if (command === undefined) {
			return;
		}

		const plugin = this.bot.plugins.get(command);

		if (!this.bot.verifyRolePermission(cmd, plugin)) {
			console.log("no permission");
			return;
		}

		plugin.plugin.process(cmd, parts);
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