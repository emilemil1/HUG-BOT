const request = require("request");
const Tools = require("../misc/tools");

class MTG {
	constructor(bot) {
		this.bot = bot;
		bot.registerPlugin("Magic The Gathering", ["mtg", "magic"], this, {
			type: "boolean",
			default: false
		});
	}

	process(cmd, parts) {
		if (!this.bot.getConfig("mtg", cmd.guild.id)) {
			return;
		}
		
		const url = encodeURIComponent(cmd.content.substring(parts[0].length+1));

		request("https://api.scryfall.com/cards/named?fuzzy=" + url, (error, response, body) => {
			body = JSON.parse(body);
			if (body.object === "error" && body.type === "ambiguous") {
				this.extendSearch(url, cmd);
				return;
			}

			this.postEmbed([body], cmd, url);
		});
	}

	extendSearch(search, cmd) {
		request("https://api.scryfall.com/cards/search?q=" + search, (error, response, body) => {
			body = JSON.parse(body);
			if (body.object === "error") {
				return;
			}

			this.postEmbed(body.data, cmd, search);
		});
	}

	postEmbed(cards, cmd, url) {
		const embed = Tools.stubEmbed()
			.setImage(cards[0].image_uris.border_crop)
			.setAuthor("Magic The Gathering")
			.setDescription(`Price: ${cards[0].prices.eur} EUR  |  ${cards[0].prices.usd} USD`);

		if (cards.length > 1) {
			embed
				.setTitle("All Search Results")
				.setURL(`https://scryfall.com/search?q=${url}`);
		}

		cmd.channel.send(embed);
	}
}

module.exports = MTG;