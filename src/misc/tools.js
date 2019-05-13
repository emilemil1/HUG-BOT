const Discord = require("discord.js");

class Tools {
	static shortEmbed(title, message) {
		return new Discord.RichEmbed()
			.setColor(Tools.prototype.color)
			.addField(title, message);
	}

	static stubEmbed() {
		return new Discord.RichEmbed()
			.setColor(Tools.prototype.color);
	}

	static buildPlugin(plugin) {
		return new PluginBuilder(plugin);
	}
}

class PluginBuilder {
	constructor(plugin) {
		this.payload = {
			plugin: plugin
		};
		this.setAdmin(false);
	}

	setName(name) {
		this.payload.name = name;
		return this;
	}

	setCommands(commands) {
		this.payload.commands = commands;
		return this;
	}

	setAdmin(bool) {
		this.payload.admin = bool;
		return this;
	}

	setConfig(type, def) {
		this.payload.config = {
			type: type,
			default: def
		};
		return this;
	}
}

Tools.prototype.color = "#23A5E3";

module.exports = Tools;