const request = require("request");
const Tools = require("../misc/tools");

class MTG {
	constructor(bot) {
		this.bot = bot;
		const plugin = Tools.buildPlugin(this)
			.setName("Magic: The Gathering")
			.setCommands(["mtg", "magic"])
			.setConfig("boolean", false);

		bot.registerPlugin(plugin);
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

			this.postEmbed(body, cmd, url, 1);
		});
	}

	extendSearch(search, cmd) {
		request("https://api.scryfall.com/cards/search?q=" + search, (error, response, body) => {
			body = JSON.parse(body);
			if (body.object === "error") {
				return;
			}

			this.postEmbed(body.data[0], cmd, search, body.total_cards);
		});
	}

	postEmbed(cards, cmd, url, count) {
		const embed = Tools.stubEmbed()
			.setImage(cards.image_uris.border_crop)
			.setAuthor("Magic The Gathering")
			.setDescription(`Price: ${cards.prices.eur} EUR  |  ${cards.prices.usd} USD`);

		if (count > 1) {
			embed
				.setTitle(`All Search Results (${count})`)
				.setURL(`https://scryfall.com/search?q=${url}`);
		}

		cmd.channel.send(embed);
	}
}

module.exports = MTG;