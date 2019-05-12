const Tools = require("../misc/tools");

class Nickname {
	constructor(bot) {
		this.bot = bot;
		bot.registerPlugin("Nickname", ["nick", "nickname"], this);
	}

	process(cmd, parts) {
		const nickname = cmd.content.substring(parts[0].length+1);

		cmd.guild.member(this.bot._client.user).setNickname(nickname);
		cmd.channel.send(Tools.shortEmbed("Nickname", `Bot nickname changed to '${nickname}'`));
	}
}

module.exports = Nickname;

