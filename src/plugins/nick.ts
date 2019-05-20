import { PluginBuilder } from "../pluginManager";
import { PluginTools } from "../misc/pluginTools";

class Nickname {
	private tools: PluginTools

	constructor(builder: PluginBuilder) {
		builder.name = "BOT Nickname";
		builder.commands = ["nick", "nickname"];
		builder.handler = this.process.bind(this);
		builder.extendedPermissions = true;
		builder.alwaysOn = true;
		this.tools = builder.register();
	}

	process(input: Input) {
		if (input.parts.length === 1) {
			return;
		}

		const nickname = input.content.substring(input.parts[0].length+1);

		input.guild.member(this.tools.client.user).setNickname(nickname);
		input.channel.send(this.tools.embed.addField("BOT Nickname", `Bot nickname changed to '${nickname}'`));
	}
}

module.exports = Nickname;

