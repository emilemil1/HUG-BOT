const Tools = require("../misc/tools");

class Config {
	constructor(bot) {
		this.bot = bot;
		bot.registerPlugin("Configuration", "config", this);
	}

	process(cmd, parts) {
		if (parts.length === 1) {
			this.listAll(cmd);
			return;
		}

		const command = this.bot._commandMap.get(parts[1]);

		if (!command || !this.bot.configs.has(command.names[0])) {
			return;
		}

		if (parts.length === 2) {
			this.listSingle(cmd, command);
			return;
		}

		if (parts.length >= 3) {
			this.setSingle(cmd, command, parts[2]);
			return;
		}
	}

	setSingle(cmd, command, value) {
		const newValue = this.validate(command.names[0], value);
		if (newValue === undefined) {
			cmd.channel.send(Tools.shortEmbed("Configuration", `**${command.title}** cannot be set to '${value}'`));
			return;
		}

		const server = this.bot.getServer(cmd.guild.id, true);
		const changedConfig = this.bot.changedConfigs[cmd.guild.id] ? this.bot.changedConfigs[cmd.guild.id] : this.bot.changedConfigs[cmd.guild.id] = {};
		server[command.names[0]] = changedConfig[command.names[0]] = newValue.value;

		cmd.channel.send(Tools.shortEmbed("Configuration", `**${command.title}** has ${newValue.has}`));
	}

	listSingle(cmd, command) {
		const value = this.bot.getConfig(command.names[0], cmd.guild.id);
		if (value === undefined) {
			return;
		}
		cmd.channel.send(Tools.shortEmbed("Configuration", `**${command.title}** is ${this.validate(command.names[0], value).is}`));
	}

	listAll(cmd) {
		const server = this.bot.getServer(cmd.guild.id);

		let message = "";
		let command;
		for (const cfg of Array.from(this.bot.configs.keys()).sort()) {
			command = this.bot._commandMap.get(cfg);
			message += `**${command.title} **(.${command.names.join(", .")})  :  ${this.validate(cfg, server[cfg]).text}\n`;
		}

		cmd.channel.send(Tools.shortEmbed("Configuration", message));
	}

	validate(setting, value) {
		const config = this.bot.configs.get(setting);
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