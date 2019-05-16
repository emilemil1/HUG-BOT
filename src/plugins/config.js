const Tools = require("../misc/tools");

class Config {
	constructor(bot) {
		this.bot = bot;
		const plugin = Tools.buildPlugin(this)
			.setName("Configuration")
			.setCommands(["config"])
			.setAdmin(true);
		
		this.plugin = bot.registerPlugin(plugin);
	}

	process(cmd, parts) {
		if (parts.length === 1) {
			this.listAll(cmd);
			return;
		}

		const command = this.bot.commands.get(parts[1]);

		if (!command || !this.bot.plugins.has(command)) {
			return;
		}

		if (parts.length === 2) {
			this.listSingle(cmd, this.bot.plugins.get(command));
			return;
		}

		if (parts.length >= 3) {
			this.setSingle(cmd, this.bot.plugins.get(command), parts[2]);
			return;
		}
	}

	setSingle(cmd, plugin, value) {
		const newValue = this.validate(plugin.config, value);

		if (newValue === undefined) {
			cmd.channel.send(Tools.shortEmbed("Configuration", `**${plugin.name}** cannot be set to '${value}'`));
			return;
		}

		const server = this.bot.getServer(cmd.guild.id, true);
		const changedConfig = this.bot.changedConfigs[cmd.guild.id] ? this.bot.changedConfigs[cmd.guild.id] : this.bot.changedConfigs[cmd.guild.id] = {};
		server[plugin.commands[0]] = changedConfig[plugin.commands[0]] = newValue.value;

		cmd.channel.send(Tools.shortEmbed("Configuration", `**${plugin.name}** has ${newValue.has}`));
	}

	listSingle(cmd, plugin) {
		const value = this.bot.getConfig(plugin.commands[0], cmd.guild.id);
		if (value === undefined) {
			return;
		}
		cmd.channel.send(Tools.shortEmbed("Configuration", `**${plugin.name}** is ${this.validate(plugin.config, value).is}`));
	}

	listAll(cmd) {
		const server = this.bot.getServer(cmd.guild.id);

		let message = "";
		for (const plugin of Array.from(this.bot.plugins.values()).filter(v => v.config !== undefined).sort()) {
			message += `**${plugin.name} **(.${plugin.commands.join(" .")})  :  ${this.validate(plugin.config, server[plugin.commands[0]]).text}\n`;
		}

		if (message === "") {
			return;
		}

		cmd.channel.send(Tools.shortEmbed("Configuration", message));
	}

	validate(config, value) {
		const type = config.type;
		if (value === undefined) {
			value = String(config.default);
		}
		if (type === "boolean") {
			if (typeof value !== "string") {
				value = String(value);
			}
			switch(value) {
			case "true":
			case "on":
			case "enable":
			case "enabled":
				return {
					value: true,
					text: "enabled",
					has: "been enabled",
					is: "enabled"
				};
			case "false":
			case "off":
			case "disable":
			case "disabled":
				return {
					value: false,
					text: "disabled",
					has: "been disabled",
					is: "disabled"
				};
			default:
				return undefined;
			}
		}
	}
}

module.exports = Config;