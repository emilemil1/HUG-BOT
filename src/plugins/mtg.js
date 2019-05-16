const request = require("request");
const Tools = require("../misc/tools");

class MTG {
	constructor(bot) {
		this.bot = bot;
		const plugin = Tools.buildPlugin(this)
			.setName("Magic: The Gathering")
			.setCommands(["mtg", "magic"])
			.setConfig("boolean", false);

		this.plugin = bot.registerPlugin(plugin);
	}

	process(cmd, parts) {
		if (parts.length === 1) {
			return;
		}

		const url = encodeURIComponent(cmd.content.substring(parts[0].length+1));

		const requestOptions = {
			url: "https://api.scryfall.com/cards/named?fuzzy=" + url,
			headers: {
				"Cache-Control": "max-age=86400"
			}
		};

		request(requestOptions, (error, response, body) => {
			body = JSON.parse(body);
			if (body.object === "error") {
				if (body.status === 404) {
					return;
				}
				if (body.type === "ambiguous") {
					this.extendSearch(url, cmd);
					return;
				}
			}

			this.postEmbed(body, cmd, url, 1);
		});
	}

	extendSearch(search, cmd) {
		const requestOptions = {
			url: "https://api.scryfall.com/cards/search?q=" + search,
			headers: {
				"Cache-Control": "max-age=86400"
			}
		};

		request(requestOptions, (error, response, body) => {
			body = JSON.parse(body);
			if (body.object === "error") {
				return;
			}

			this.postEmbed(body.data[0], cmd, search, body.total_cards);
		});
	}

	postEmbed(card, cmd, url, count) {
		const priceString = this.getPrice(card.prices);
		const format = this.getFormat(card.legalities);
		const embed = Tools.stubEmbed()
			.setImage(card.image_uris.border_crop)
			.setAuthor(`${card.name} (${card.set.toUpperCase()})`, undefined, card.scryfall_uri)
			.setDescription(`${format}${priceString}`);

		if (count > 1) {
			embed
				.setTitle(`All Results (${count})`)
				.setURL(`https://scryfall.com/search?q=${url}`);
		}

		cmd.channel.send(embed);
	}

	getPrice(prices) {
		const usd = prices.usd;
		const eur = prices.eur;
		let string = "";
		if (usd || eur) {
			string += " • ";
		}
		if (usd) {
			string += `$${usd}`;
		}
		if (usd, eur) {
			string += " • ";
		}
		if (eur) {
			string += `€${eur}`;
		}
		return string;
	}

	getFormat(legalities) {
		if (legalities.standard === "legal") {
			return "Standard";
		}
		if (legalities.modern === "legal") {
			return "Modern";
		}
		if (legalities.legacy === "legal") {
			return "Legacy";
		}
		if (legalities.vintage === "legal") {
			return "Vintage";
		}
		if (legalities.vintage === "restricted") {
			return "Vintage (Restricted)";
		}
		if (legalities.commander === "legal") {
			return "Commander";
		}
		return "Not Legal";
	}
}

module.exports = MTG;