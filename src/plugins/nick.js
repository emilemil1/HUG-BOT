const Tools = require("../misc/tools");

class Nickname {
	constructor(bot) {
		this.bot = bot;
		const plugin = Tools.buildPlugin(this)
			.setName("BOT Nickname")
			.setAdmin(true)
			.setCommands(["nick", "nickname"]);

		this.plugin = bot.registerPlugin(plugin);
	}

	process(cmd, parts) {
		if (parts.length === 1) {
			return;
		}

		const nickname = cmd.content.substring(parts[0].length+1);

		cmd.guild.member(this.bot._client.user).setNickname(nickname);
		cmd.channel.send(Tools.shortEmbed("Nickname", `Bot nickname changed to '${nickname}'`));
	}
}

module.exports = Nickname;

