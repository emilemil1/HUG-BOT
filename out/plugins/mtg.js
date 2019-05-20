"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
class MTG {
    constructor(builder) {
        builder.name = "Magic: The Gathering";
        builder.commands = ["mtg", "magic"];
        builder.handler = this.process.bind(this);
        builder.extendedPermissions = false;
        this.tools = builder.register();
    }
    process(input) {
        if (input.parts.length === 1) {
            return;
        }
        let card;
        let set;
        let setString;
        const start = input.content.lastIndexOf("(");
        const end = input.content.lastIndexOf(")");
        if (start !== -1 && end !== -1) {
            set = encodeURI(input.content.substring(start + 1, end));
            setString = `&set='${set}'`;
            card = encodeURI(input.content.substring(input.parts[0].length + 1, start - 1));
        }
        else {
            setString = "";
            card = encodeURI(input.content.substring(input.parts[0].length + 1));
        }
        let url = "https://api.scryfall.com/cards/named?fuzzy=" + card + setString;
        const requestOptions = {
            url: url,
            headers: {
                "Cache-Control": "max-age=86400"
            }
        };
        request(requestOptions, (error, response, body) => {
            body = JSON.parse(body);
            if (body.object === "error") {
                if (body.status === 404 && !body.type) {
                    return;
                }
                if (body.type === "ambiguous") {
                    this.extendSearch(card, set, input);
                    return;
                }
            }
            this.postEmbed(body, card, set, input, 1);
        });
    }
    extendSearch(card, set, input) {
        let url = "https://api.scryfall.com/cards/search?q=" + card;
        if (set) {
            url += `%20set:'${set}'`;
        }
        url += "&order=released";
        const requestOptions = {
            url: url,
            headers: {
                "Cache-Control": "max-age=86400"
            }
        };
        request(requestOptions, (error, response, body) => {
            body = JSON.parse(body);
            if (body.object === "error") {
                return;
            }
            this.postEmbed(body.data[0], card, set, input, body.total_cards);
        });
    }
    postEmbed(card, c, set, input, count) {
        const priceString = this.getPrice(card.prices);
        const format = this.getFormat(card.legalities);
        const embed = this.tools.embed
            .setImage(card.image_uris.border_crop)
            .setAuthor(`${card.name} (${card.set.toUpperCase()})`, undefined, card.scryfall_uri)
            .setDescription(`${format}${priceString}`);
        if (count > 1) {
            embed
                .setTitle(`All Results (${count})`)
                .setURL(`https://scryfall.com/search?q=${c}${set ? `%20set:'${set}'` : ""}`);
        }
        input.channel.send(embed);
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
        if (usd && eur) {
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
//# sourceMappingURL=mtg.js.map