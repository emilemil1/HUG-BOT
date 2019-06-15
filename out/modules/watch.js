"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Watch {
    constructor(builder) {
        this.cache = new Map();
        builder.name = "Watcher";
        builder.commands = ["watch", "spy", "unwatch"];
        builder.messageHandler = this.process.bind(this);
        builder.helpHandler = this.help.bind(this);
        builder.passiveHandler = this.passive.bind(this);
        builder.extendedPermissions = false;
        builder.data = {
            matches: {},
            silent: {}
        };
        this.tools = builder.register();
        this.tools.client.on("sync", this.sync.bind(this));
        this.tools.client.on("guildCreate", (guild) => {
            this.cache.set(guild.id, {
                regex: this.buildRegex(this.tools.getConfigs(guild.id)["watch"].data.matches),
                matches: this.tools.getConfigs(guild.id)["watch"].data.matches,
                silent: this.tools.getConfigs(guild.id)["watch"].data.silent
            });
        });
    }
    sync() {
        for (const guild of this.tools.client.guilds.values()) {
            const matches = this.tools.getConfigs(guild.id)["watch"].data.matches;
            const silent = this.tools.getConfigs(guild.id)["watch"].data.silent;
            for (const users of Object.entries(matches)) {
                for (const user of users[1]) {
                    if (guild.members.has(user)) {
                        continue;
                    }
                    if (matches[users[0]].length === 1) {
                        delete matches[users[0]];
                    }
                    else {
                        matches[users[0]].splice(matches[users[0]].findIndex(t => t === user));
                    }
                    delete silent[user];
                }
            }
            this.cache.set(guild.id, {
                regex: this.buildRegex(matches),
                matches: matches,
                silent: silent
            });
        }
    }
    help(input) {
        const description = `
		Get notified when certain text appears in chat.
		Spy to receive an anonymous DM instead.
		⠀
		`;
        const unwatch = `
		\`\`\`.unwatch\`\`\`
		`;
        const watch = `
		\`\`\`.watch [text]\`\`\`
		`;
        const spy = `
		\`\`\`.spy [text]\`\`\`
		`;
        input.channel.send(this.tools.embed.addField("Watcher", description).addField("Unwatch", unwatch).addField("Watch", watch).addField("Spy", spy));
    }
    process(input) {
        if (input.parts[0] === "unwatch") {
            this.unwatch(input);
            return;
        }
        if (input.parts.length === 1 || input.parts.length > 4) {
            return;
        }
        let offset = input.parts[0].length + 1;
        let track = input.content.substring(offset).toLowerCase();
        const data = this.cache.get(input.guild.id);
        const id = input.message.member.id;
        for (const arr of Object.entries(data.matches)) {
            if (arr[1].includes(id)) {
                if (data.matches[arr[0]].length === 1) {
                    delete data.matches[arr[0]];
                }
                else {
                    data.matches[arr[0]].splice(data.matches[arr[0]].findIndex(t => t === id));
                }
                delete data.silent[id];
                break;
            }
        }
        if (input.parts[0] === "spy") {
            input.channel.send(this.tools.embed.addField("Watcher", `**${input.message.member.displayName}** is now spying on '${track}'`));
            data.silent[id] = null;
        }
        else {
            input.channel.send(this.tools.embed.addField("Watcher", `**${input.message.member.displayName}** is now watching '${track}'`));
        }
        if (data.matches[track] === undefined) {
            data.matches[track] = [];
        }
        data.matches[track].push(id);
        this.tools.markForUpdate(input.guild.id);
        this.cache.get(input.guild.id).regex = this.buildRegex(data.matches);
    }
    unwatch(input) {
        const data = this.cache.get(input.guild.id);
        const id = input.message.member.id;
        for (const arr of Object.entries(data.matches)) {
            if (arr[1].includes(id)) {
                if (data.matches[arr[0]].length === 1) {
                    delete data.matches[arr[0]];
                }
                else {
                    data.matches[arr[0]].splice(data.matches[arr[0]].findIndex(t => t === id));
                }
                delete data.silent[id];
                this.tools.markForUpdate(input.guild.id);
                input.channel.send(this.tools.embed.addField("Watcher", `**${input.message.member.displayName}** is no longer watching '${arr[0]}'`));
                this.cache.get(input.guild.id).regex = this.buildRegex(data.matches);
                break;
            }
        }
    }
    passive(message) {
        let result;
        const data = this.cache.get(message.guild.id);
        if (data.regex === undefined) {
            return;
        }
        const loudUsers = [];
        while (null !== (result = data.regex.exec(message.content))) {
            let embed;
            for (const user of data.matches[result[0]]) {
                if (data.silent[user] === undefined) {
                    loudUsers.push(user);
                }
                else {
                    embed = embed === undefined ? this.tools.embed.addField(message.member.displayName, this.constructEmbedMessage(message, result[0], result.index)) : embed;
                    message.guild.members.get(user).send(embed).catch();
                }
            }
        }
        if (loudUsers.length === 0) {
            return;
        }
        message.channel.send("<@" + loudUsers.join("><@") + ">");
    }
    constructEmbedMessage(message, replacement, index) {
        let embedMessage;
        if (index < 15) {
            if (index + replacement.length + 15 > message.content.length) {
                embedMessage = message.content.substring(0, index) + `[${replacement}](${message.url})` + message.content.substring(index + replacement.length, message.content.length);
            }
            else {
                embedMessage = message.content.substring(0, index) + `[${replacement}](${message.url})` + message.content.substring(index + replacement.length, index + replacement.length + 15).trimEnd() + "...";
            }
        }
        else {
            if (index + replacement.length + 15 > message.content.length) {
                embedMessage = "..." + message.content.substring(index - 15, index).trimStart() + `[${replacement}](${message.url})` + message.content.substring(index + replacement.length, message.content.length);
            }
            else {
                embedMessage = "..." + message.content.substring(index - 15, index).trimStart() + `[${replacement}](${message.url})` + message.content.substring(index + replacement.length, index + replacement.length + 15).trimEnd() + "...";
            }
        }
        return embedMessage;
    }
    buildRegex(matches) {
        let rx = "";
        for (const track in matches) {
            rx += "|" + track;
        }
        if (rx === "") {
            return undefined;
        }
        rx = rx.substring(1);
        return new RegExp(rx, "gi");
    }
}
module.exports = Watch;
//# sourceMappingURL=watch.js.map