class Nickname {
	constructor(bot) {
		this.bot = bot;
		bot.registerPlugin("Nickname", ["nick", "nickname"], this);
	}

	process(cmd, parts) {
		const nickname = cmd.content.substring(parts[0].length+1);

		cmd.guild.member(this.bot._client.user).setNickname(nickname);
	}
}

module.exports = Nickname;

