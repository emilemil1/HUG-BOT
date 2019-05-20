import { Message, RichEmbed, GuildMember, Client, Guild, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { PluginTools } from "./misc/pluginTools";

declare global {
	type Command = string;
	type PluginID = string;
	type GuildID = string;
	type CommandHandler = (input: Input) => void
	type ConfigValidator = (prop: string, value: PluginConfigOption) => boolean
	
	interface BotConfig {
		discordToken: string,
		databasePrivateKey: string,
		databaseType: string,
		databaseURL: string
	}

	type PluginConfigOption = string|Array<string>;

	interface PluginConfig {
		[index: string]: PluginConfigOption
	}
	
	interface Plugins {
		[index: string]: PluginConfig
	}
	
	interface GuildConfig {
		plugins: Plugins
		roles: Roles
		RPInstances: {[index: string]: undefined|number}
		expire?: number
		update?: boolean
		[index: string]: any
	}
	
	interface Guilds {
		[index: string]: GuildConfig
	}

	interface DatabaseProxy {
		ready: boolean
		write: (guilds: Guilds) => Promise<any>
		fetch: () => Promise<Guilds>
		disconnect: () => () => Promise<void>
	}

	interface BotPlugin {
		name: string
		id: PluginID
		handler: CommandHandler
		commands: string[]
		passive: boolean
		defaultConfig: DefaultPluginConfig
		configCount: number
		alwaysOn: boolean
		validator: ConfigValidator
		extendedPermissions: boolean
	}

	interface Input {
		content: string
		parts: string[]
		guild: Guild
		channel: TextChannel | DMChannel | GroupDMChannel
		message: Message
		plugin: BotPlugin
		config: PluginConfig
	}

	interface Roles {
		[index: string]: {[index: string]: undefined|number}
	}

	interface BotExposedFunctions_Plugin {
		getConfigs: (guildID: GuildID) => Plugins
		client: Client
		getRoles: (guildID: GuildID) => Roles
		markForUpdate: (guildID: GuildID) => void
		sudo: (input: Input) => void
	}

	interface PluginManagerExposedFunctions extends BotExposedFunctions_Plugin {
		plugins: Map<PluginID, BotPlugin>
		commands: Map<Command, BotPlugin>
	}

	interface DefaultPluginConfig {
		[index: string]: {type: string, value: string}
	}
}

export {}