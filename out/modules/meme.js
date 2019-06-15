"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
class Meme {
    constructor(builder) {
        builder.name = "Memes";
        builder.commands = ["meme"];
        builder.messageHandler = this.process.bind(this);
        builder.helpHandler = this.help.bind(this);
        builder.extendedPermissions = false;
        this.tools = builder.register();
    }
    help(input) {
        const description = `
		Get your hands on a spicy meme.
		⠀
		`;
        const usage = `
		\`\`\`.meme [search]\`\`\`
		`;
        input.channel.send(this.tools.embed.addField("Help", description).addField("Usage", usage));
    }
    process(input) {
        if (input.parts.length === 1) {
            return;
        }
        let memeString = input.content.substring(input.parts[0].length + 1);
        let url = "https://api.imgur.com/3/gallery/search/viral?perPage=100&q_tags=funny,meme,memes&q_all=" + memeString;
        const requestOptions = {
            url: url,
            headers: {
                "Cache-Control": "max-age=86400",
                "Authorization": this.tools.getBotConfig().imgurAccessToken
            }
        };
        request(requestOptions, (error, response, body) => {
            const data = JSON.parse(body).data;
            const filtered = data.filter((i) => i.cover_height >= 300);
            if (filtered.length === 0) {
                return;
            }
            const images = [];
            filtered.forEach((i) => {
                i.images.forEach((a) => {
                    images.push(a.link);
                });
            });
            const rand = Math.floor(Math.random() * images.length);
            input.channel.send({
                file: images[rand]
            });
        });
    }
}
module.exports = Meme;
//# sourceMappingURL=meme.js.map