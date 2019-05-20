import { RichEmbed } from "discord.js";

export class PluginTools {
	protected functions: PluginManagerExposedFunctions;
	private static color = "#23A5E3";
	private plugin: BotPlugin;
	
	constructor(functions: PluginManagerExposedFunctions, plugin: BotPlugin) {
		this.plugin = plugin;
		this.functions = functions;
	}

	get embed() {
		return new RichEmbed().setColor(PluginTools.color);
	}

	getConfigs(guildID: GuildID) {
		return this.functions.getConfigs(guildID);
	}

	get plugins() {
		return this.functions.plugins
	}

	get client() {
		return this.functions.client
	}

	getRoles(guildID: GuildID) {
		return this.functions.getRoles(guildID);
	}

	markForUpdate(guildID: GuildID) {
		this.functions.markForUpdate(guildID);
	}

	sudo(input: Input) {
		this.functions.sudo(input);
	}
}