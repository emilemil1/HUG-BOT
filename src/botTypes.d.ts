import { Message, RichEmbed, GuildMember, Client, Guild, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { PluginTools } from "./misc/pluginTools";

declare global {
	type Command = string;
	type PluginID = string;
	type GuildID = string;
	type CommandHandler = (input: Input) => void
	type PassiveHandler = (message: Message) => void
	type ConfigValidator = (prop: string, value: PluginConfigOption) => boolean
	
	interface BotConfig {
		discordToken: string,
		databasePrivateKey: string,
		databaseType: string,
		databaseURL: string,
		imgurAccessToken: string
	}

	type PluginConfigOption = null|string|string[]|{[index:string]: null|string|string[]};

	interface PluginConfig {
		config?: {[index: string]: string}
		data?: {[index: string]: PluginConfigOption}
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
		messageHandler: CommandHandler
		helpHandler: CommandHandler
		passiveHandler?: PassiveHandler
		catchupHandler?: () => void
		commands: string[]
		config?: {[index: string]: string}
		data?: {[index: string]: PluginConfigOption}
		alwaysOn: boolean
		extendedPermissions: boolean
	}

	interface Input {
		content: string
		parts: string[]
		guild: Guild
		channel: TextChannel | DMChannel | GroupDMChannel
		message: Message
		plugin: BotPlugin
		config?: {[index: string]: string}
		data?: {[index: string]: PluginConfigOption}
	}

	interface Roles {
		[index: string]: {[index: string]: undefined|number|null}
	}

	interface BotExposedFunctions_Plugin {
		getConfigs: (guildID: GuildID) => Plugins
		client: Client
		getRoles: (guildID: GuildID) => Roles
		markForUpdate: (guildID: GuildID) => void
		sudo: (input: Input) => void,
		getRolePluginCounts: (guildID: GuildID) => {[index: string]: undefined|number},
		getBotConfig: () => BotConfig
	}

	interface PluginManagerExposedFunctions extends BotExposedFunctions_Plugin {
		plugins: Map<PluginID, BotPlugin>
		commands: Map<Command, BotPlugin>
	}
}

export {}