import { readdirSync } from "fs";
import { PluginTools } from "./misc/pluginTools";

export default class PluginManager {
	private pluginsMap = new Map<PluginID, BotPlugin>();
	private commandMap = new Map<Command, BotPlugin>();
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
			commands: pluginBuilder.commands,
			passive: pluginBuilder.passive,
			defaultConfig: pluginBuilder.defaultConfig,
			configCount: Object.keys(pluginBuilder.defaultConfig).length,
			validator: pluginBuilder.validator,
			extendedPermissions: pluginBuilder.extendedPermissions,
			alwaysOn: pluginBuilder.alwaysOn
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
	commands?: string[];
	passive: boolean = false;
	defaultConfig: DefaultPluginConfig = {};
	validator: ConfigValidator = () => false;
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