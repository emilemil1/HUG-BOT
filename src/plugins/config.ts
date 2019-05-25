import { PluginBuilder } from "../pluginManager";
import { PluginTools } from "../misc/pluginTools";

class Config {
	private tools: PluginTools;

	constructor(builder: PluginBuilder) {
		builder.name = "Configuration";
		builder.commands = ["config"];
		builder.messageHandler = this.process.bind(this);
		builder.helpHandler = this.help.bind(this);
		builder.extendedPermissions = true;
		builder.alwaysOn = true;
		this.tools = builder.register();
	}

	help(input: Input) {
		input.channel.send(this.tools.embed.addField("Placeholder", "Placeholder"));
	}

	process(input: Input) {
		if (input.parts.length === 1) {
			this.help(input);
			return;
		}

		if (input.parts.length === 2) {
			this.listSingle(input);
			return;
		}

		if (input.parts.length === 3) {
			input.parts.push(input.parts[2]);
			input.parts[2] = "status";
			this.setSingle(input);
			return;
		}

		if (input.parts.length === 4) {
			this.setSingle(input);
			return;
		}
	}

	setSingle(input: Input) {
		const plugin = this.tools.plugins.get(input.parts[1]);
		if (!plugin) {
			return;
		}
		const pluginConfig = this.tools.getConfigs(input.guild.id)[plugin.id];
		if (!pluginConfig) {
			return;
		}
		const config = pluginConfig.config;
		if (!config || !config[input.parts[2]]) {
			return;
		}

		const newValue = Config.import(input.parts[3], config[input.parts[2]])
		if (newValue === undefined) {
			input.channel.send(this.tools.embed.addField(plugin.name, `**${input.parts[2].charAt(0).toUpperCase()}${input.parts[2].substring(1)}** cannot be set to '${input.parts[3]}'`));
			return;
		}
		input.channel.send(this.tools.embed.addField(plugin.name, `**${input.parts[2].charAt(0).toUpperCase()}${input.parts[2].substring(1)}** has ${Config.export(newValue).has}`));

		config[input.parts[2]] = newValue;
		this.tools.markForUpdate(input.guild.id);

		
	}

	listSingle(input: Input) {
		const plugin = this.tools.plugins.get(input.parts[1]);
		if (!plugin) {
			return;
		}
		const pluginConfig = this.tools.getConfigs(input.guild.id)[plugin.id];
		if (!pluginConfig) {
			return;
		}
		const config = pluginConfig.config;
		if (!config) {
			return;
		}
		let reply = "";
		for (const option of Object.entries(config)) {
			reply += `**${option[0].charAt(0).toUpperCase()}${option[0].substring(1)}** : ${Config.export(option[1]).text}`
		}
		input.channel.send(this.tools.embed.addField(plugin.name, reply));
	}

	static export(value: PluginConfigOption) {
		switch(value) {
		case "true":
			return {
				value: "true",
				text: "enabled",
				has: "been enabled"
			};
		case "false":
			return {
				value: "false",
				text: "disabled",
				has: "been disabled"
			};
		}
		return {
			value: value,
			text: value,
			has: "been set to " + value
		};
	}

	static import(value: string, oldValue: PluginConfigOption) {
		if (value === oldValue) {
			return undefined;
		}

		if (oldValue === "true" || oldValue === "false") {
			return Config.importBoolean(value);
		}
		if (Number(oldValue) != NaN) {
			return Config.importNumber(value);
		}
		return value;

		
	}

	static importBoolean(value: string) {
		switch(value) {
			case "on":
			case "enable":
			case "enabled":
				return "true"
			case "off":
			case "disable":
			case "disable":
				return "false"
			}
			return undefined;
	}

	static importNumber(value: string) {
		if (Number(value) === NaN) {
			return undefined;
		}
		return Number(value).toString();
	}
}

module.exports = Config;