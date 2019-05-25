import { readdirSync } from "fs";
import { PluginTools } from "./misc/pluginTools";

export default class PluginManager {
	private pluginsMap = new Map<PluginID, BotPlugin>();
	private commandMap = new Map<Command, BotPlugin>();
	private passiveSet = new Set<BotPlugin>();
	private exposedFunctions: PluginManagerExposedFunctions;

	constructor(exposedFunctions: BotExposedFunctions_Plugin) {
		this.exposedFunctions = {
			...exposedFunctions,
			plugins: this.plugins,
			commands: this.commands
		}
		const files = readdirSync("src/plugins");
		for (let file of files) {
			file = file.substring(0, file.lastIndexOf("."));
			const PluginFile = require("./plugins/" + file + ".js");
			new PluginFile(new PluginBuilder(this.registerPlugin.bind(this)));
		}
	}

	get plugins() {
		return this.pluginsMap;
	}

	get commands() {
		return this.commandMap;
	}

	get passive() {
		return this.passiveSet;
	}

	private registerPlugin(pluginBuilder: PluginBuilder): PluginTools|undefined {
		if (!pluginBuilder.name) {
			console.log("Failed to initialize plugin without a name.");
			return;
		}
		if (!pluginBuilder.commands || pluginBuilder.commands.length === 0) {
			console.log("Failed to initialize plugin without a command: " + pluginBuilder.name);
			return;
		}
		if (!pluginBuilder.messageHandler) {
			console.log("Failed to initialize plugin without a message handler: " + pluginBuilder.name);
			return;
		}
		if (!pluginBuilder.helpHandler) {
			console.log("Failed to initialize plugin without a help handler: " + pluginBuilder.name);
			return;
		}
		const plugin = {
			name: pluginBuilder.name,
			id: pluginBuilder.commands[0],
			messageHandler: pluginBuilder.messageHandler,
			helpHandler: pluginBuilder.helpHandler,
			passiveHandler: pluginBuilder.passiveHandler,
			catchupHandler: pluginBuilder.catchupHandler,
			commands: pluginBuilder.commands,
			config: pluginBuilder.config,
			data: pluginBuilder.data,
			extendedPermissions: pluginBuilder.extendedPermissions,
			alwaysOn: pluginBuilder.alwaysOn
		}
		if (!plugin.alwaysOn) {
			if (plugin.config === undefined) {
				plugin.config = {}
			}
			plugin.config.status = "false";
		}
		if (plugin.config === undefined) {
			delete plugin.config;
		}
		if (plugin.data === undefined) {
			delete plugin.data;
		}
		if (plugin.catchupHandler === undefined) {
			delete plugin.catchupHandler;
		}
		if (plugin.passiveHandler === undefined) {
			delete plugin.passiveHandler;
		} else {
			this.passiveSet.add(plugin);
		}
		
		for (const command of plugin.commands) {
			this.commandMap.set(command, plugin);
		}
		this.pluginsMap.set(plugin.id, plugin);

		return new PluginTools(this.exposedFunctions, plugin);
	}
}

export class PluginBuilder {
	name?: string;
	messageHandler?: CommandHandler;
	helpHandler?: CommandHandler;
	passiveHandler?: PassiveHandler
	catchupHandler?: () => void
	commands?: string[];
	config?: {[index: string]: string};
	data?: {[index: string]: PluginConfigOption};
	extendedPermissions: boolean = false;
	alwaysOn: boolean = false;

	private registerFunc: (pluginBuilder: PluginBuilder) => PluginTools|undefined;

	constructor(registerFunc: (pluginBuilder: PluginBuilder) => PluginTools|undefined) {
		this.registerFunc = registerFunc;
	}

	register() {
		return this.registerFunc(this)!;
	}
}