import { PluginBuilder } from "../pluginManager";
import { PluginTools } from "../misc/pluginTools";

class Help {
	private tools: PluginTools

	constructor(builder: PluginBuilder) {
		builder.name = "Help";
		builder.commands = ["help"];
		builder.messageHandler = this.process.bind(this);
		builder.helpHandler = this.help.bind(this);
		builder.extendedPermissions = true;
		builder.alwaysOn = true;
		this.tools = builder.register();
	}

	process(input: Input) {
		if (input.parts.length === 1) {
			this.help(input);
			return;
		}
		this.helpPlugin(input);
	}

	help(input: Input) {
		const description = `
		Displays help information about other modules.
		To see a list of available modules, use '.commands'.
		⠀
		`
		const usage = `
		\`\`\`.help [command]\`\`\`
		`
		input.channel.send(this.tools.embed.addField("Help", description).addField("Usage", usage));
	}

	helpPlugin(input: Input) {
		const plugin = this.tools.commands.get(input.parts[1]);
		if (!plugin) {
			return;
		}
		if (input.parts.length === 2) {
			plugin.helpHandler(input);
			return;
		}
		const offset = input.parts[0].length + input.parts[1].length + 2;
		input.content = input.content.substring(offset);
		input.parts = input.parts.slice(2);
		plugin.helpHandler(input);
	}
}

module.exports = Help;

