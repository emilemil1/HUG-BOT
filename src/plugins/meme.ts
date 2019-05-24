import { PluginBuilder } from "../pluginManager";
import { PluginTools } from "../misc/pluginTools";
import * as request from "request";

class Meme {
	private tools: PluginTools;

	constructor(builder: PluginBuilder) {
		builder.name = "Memes";
		builder.commands = ["meme"];
		builder.messageHandler = this.process.bind(this);
		builder.helpHandler = this.help.bind(this);
		builder.extendedPermissions = false;
		this.tools = builder.register();
	}

	help(input: Input) {
		input.channel.send(this.tools.embed.addField("Placeholder", "Placeholder"));
	}

	process(input: Input) {
		if (input.parts.length === 1) {
			return;
		}

		let memeString = input.content.substring(input.parts[0].length+1);
		let url = "https://api.imgur.com/3/gallery/search/top?q=" + memeString;

		const requestOptions = {
			url: url,
			headers: {
				"Cache-Control": "max-age=86400",
				"Authorization": this.tools.getBotConfig().imgurAccessToken
			}
		};

		request(requestOptions, (error, response, body) => {
			const data = JSON.parse(body).data;
			const filtered = data.filter((i:any) => i.cover_height >= 300);
			if (filtered.length === 0) {
				return;
			}
			const images: string[] = [];
			filtered.forEach((i:any) => {
				i.images.forEach((a:any) => {
					images.push(a.link);
				})
			})
			const rand = Math.floor(Math.random() * images.length);
			input.channel.send({
				file: images[rand]
			});
		});
	}
}

module.exports = Meme;