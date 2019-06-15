import { PluginBuilder } from "../pluginManager";
import { PluginTools } from "../misc/pluginTools";
import { Message } from "discord.js";
import GoogleCloudProxy from "../externals/googlecloudProxy";

interface Data {
	auto: {[index: string]:string}
}

class Translate {
	private tools: PluginTools;
	private cache: Map<string, Data>
	private translator: GoogleCloudProxy;

	constructor(builder: PluginBuilder) {
		this.cache = new Map();

		builder.name = "Translate";
		builder.commands = ["translate"];
		builder.messageHandler = this.process.bind(this);
		builder.helpHandler = this.help.bind(this);
		builder.passiveHandler = this.passive.bind(this);
		builder.extendedPermissions = false;
		builder.data = {
			auto: {},
		}
		builder.tearDown = () => new Promise(resolve => this.translator.disconnect());

		this.tools = builder.register();

		this.tools.client.on("sync", this.sync.bind(this))
		this.tools.client.on("guildCreate", (guild) => {
			this.cache.set(guild.id, {
				auto: this.tools.getConfigs(guild.id)["translate"].data!.auto as {[index: string]:string},
			})
		})
		this.translator = new GoogleCloudProxy(this.tools.getBotConfig().googleCloudKey);
	}

	sync() {
		for (const guild of this.tools.client.guilds.values()) {
			const auto = this.tools.getConfigs(guild.id)["translate"].data!.auto as {[index: string]:string}
			for (const user in auto) {
				if (guild.members.has(user)) {
					continue;
				}
				delete auto[user];
			}
			this.cache.set(guild.id, {
				auto: auto
			})
		}
	}

	help(input: Input) {
		const description = `
		Translate your messages using Google Translate.
		⠀
		`
		const translateOnce = `
		\`\`\`.translate [language] [message]\`\`\`
		`
		const translateAlways = `
		\`\`\`.translate [language]\`\`\`
		`
		const translateOff = `
		\`\`\`.translate off\`\`\`
		`

		input.channel.send(this.tools.embed.addField("Help", description).addField("Translate Once", translateOnce).addField("Automatic Translation", translateAlways).addField("Stop Automatic Translation", translateOff));
	}

	process(input: Input) {
		if (input.parts.length === 1) {
			this.help(input);
			return;
		}

		if (input.parts.length === 2 && (input.parts[1] === "off" || input.parts[1] === "disable" || input.parts[1] === "disabled" || input.parts[1] === "false")) {
			if (this.cache.get(input.guild.id)!.auto[input.message.member.id] === undefined) {
				return;
			}
			delete this.cache.get(input.guild.id)!.auto[input.message.member.id];
			input.channel.send(this.tools.embed.addField("Translate", `**${input.message.member.displayName}** is no longer being translated`));
			return;
		}

		if (input.parts.length === 2) {
			this.cache.get(input.guild.id)!.auto[input.message.member.id] = input.parts[1];
			input.channel.send(this.tools.embed.addField("Translate", `**${input.message.member.displayName}** is being automatically translated to '${input.parts[1]}'`));
			return;
		}

		input.channel.send(this.translate(input.content.substring(input.parts[0].length + input.parts[1].length + 2), input.parts[1]));
	}

	passive(message: Message) {
		const lang = this.cache.get(message.guild.id)!.auto[message.member.id];
		if (lang === undefined) {
			return;
		}
		message.channel.send(this.translate(message.content, lang));
	}

	translate(text: string, language: string) {

	}
}

module.exports = Translate;