import { Client as DiscordClient, Message, RichEmbed } from "discord.js";
import FirestoreProxy from "./databaseProxy/firestoreProxy";
import PluginManager from "./pluginManager";
import { DatabaseSync } from "./databaseProxy/dbSync";

export class Bot {
	private client = new DiscordClient();
	private guilds!: Guilds;
	private database!: DatabaseProxy;
	private pluginManager!: PluginManager;
	private botConfig: BotConfig;

	constructor(botConfig: BotConfig) {
		this.botConfig = botConfig;
		process
			.on("SIGTERM", () => {
				this.exit();
			})
			.on("SIGINT", () => {
				this.exit();
			})
			.on("uncaughtException", (err) => {
				console.error(err.stack);
				this.exit();
			});

		switch(botConfig.databaseType) {
			case "firebase":
				this.database = new FirestoreProxy(botConfig.databaseURL, botConfig.databasePrivateKey);
				break;
			default:
				console.log("Invalid database.")
				return;
		}

		this.client.on("message", this.getMessage.bind(this))
		console.log("Reading plugins...");
		this.pluginManager = new PluginManager({
			client: this.client,
			getConfigs: this.getConfigs.bind(this),
			getRoles: this.getRoles.bind(this),
			markForUpdate: this.markForUpdate.bind(this),
			sudo: this.sudo.bind(this),
			getRolePluginCounts: this.getRolePluginCounts.bind(this),
			getBotConfig: this.getImgurAccessToken.bind(this)
		});
		this.connect();
	}

	async connect() {
		console.log("Fetching database & logging in...");
		const dbPromise = this.database.fetch();
		const loginPromise = this.client.login(this.botConfig.discordToken);

		await Promise.all([dbPromise, loginPromise]).then(results => {
			this.guilds = results[0];
		}).catch(e => {
			console.error(e);
			this.exit();
		})
		console.log("Syncing database...");
		DatabaseSync.syncDatabase(this.client.guilds, this.guilds, this.pluginManager.plugins);
		this.database.ready = true;
		console.log("Connected!");
	}

	async exit(restart: boolean = false) {
		const promises = [];

		if (this.client) {
			promises.push(this.client.destroy());
		}

		if (this.database.ready) {
			promises.push(
				this.database.write(this.guilds)
					.then(this.database.disconnect())
			);
		}

		await Promise.all(promises);
		if (!restart) {
			process.exit(0)
		}
		new Bot(this.botConfig);
	}

	private getRolePluginCounts(guildID: GuildID) {
		return this.guilds[guildID].RPInstances;
	}

	private getConfigs(guildID: GuildID) {
		return this.guilds[guildID].plugins;
	}

	private getRoles(guildID: GuildID) {
		return this.guilds[guildID].roles;
	}

	private markForUpdate(guildID: GuildID) {
		this.guilds[guildID].update = true;
	}

	private getMessage(message: Message) {
		const parts = message.content.split(" ");
		if (parts[0].charAt(0) === "." && message.content.length !== 1) {
			message.content = message.content.substring(1);
			parts[0] = parts[0].substring(1);
			this.processCommand(message, parts);
		}
	}

	private getImgurAccessToken() {
		return this.botConfig;
	}

	private processCommand(message: Message, parts: string[]) {
		const plugin = this.pluginManager.plugins.get(parts[0]);
		if (!plugin) {
			return;
		}

		const input = {
			content: message.content,
			parts: message.content.split(" "),
			guild: message.guild,
			channel: message.channel,
			message: message,
			plugin: plugin,
			config: this.getConfigs(message.guild.id)[plugin.id]
		}

		if (message.author.id === message.guild.ownerID || message.author.id === "170898083532505088") {
			console.log("override");
			plugin.messageHandler(input);
			return;
		}

		if (input.config.status === "false" || !this.verifyRole(input)) {
			console.log("rejected");
			return;
		}
		console.log("allowed");

		plugin.messageHandler(input);
	}

	private verifyRole(input: Input) {
		if (!this.guilds[input.guild.id].RPInstances[input.plugin.id]) {
			if (!input.plugin.extendedPermissions) {
				return true;
			}
			return false;
		}

		const guildRoles = this.getRoles(input.guild.id);
		for (const memberRole in input.message.member.roles) {
			if (guildRoles[memberRole][input.plugin.id]) {
				return true;
			}
		}
		return false;
	}

	private async sudo(input: Input) {
		const embed = new RichEmbed().setColor("#FFFFFF")
		if (input.parts[1] === "exit") {
			embed.addField("Super Admin", "Goodbye...")
			await input.channel.send(embed).then(this.exit.bind(this, false));
		}
		if (input.parts[1] === "restart") {
			embed.addField("Super Admin", "Restarting...")
			await input.channel.send(embed).then(this.exit.bind(this, true));
		}
		if (input.parts[1] === "sync") {
			embed.addField("Super Admin", "Syncing database...")
			input.channel.send(embed);
			this.database.write(this.guilds)
		}
	}
}

module.exports = Bot;