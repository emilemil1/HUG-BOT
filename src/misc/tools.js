const Discord = require("discord.js");

class Tools {
	static shortEmbed(title, message) {
		return new Discord.RichEmbed()
			.setColor(Tools.prototype.color)
			.addField(title, message);
	}

	static stubEmbed() {
		return new Discord.RichEmbed()
			.setColor(Tools.prototype.color);
	}
}

Tools.prototype.color = "#23A5E3";

module.exports = Tools;