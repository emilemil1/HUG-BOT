"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Watch {
    constructor(builder) {
        builder.name = "Watch";
        builder.commands = ["watch", "spy", "unwatch"];
        builder.messageHandler = this.process.bind(this);
        builder.helpHandler = this.help.bind(this);
        builder.passiveHandler = this.passive.bind(this);
        builder.extendedPermissions = false;
        builder.data = {
            matches: {},
            users: {},
            silent: {}
        };
        this.tools = builder.register();
        //TODO - sync members on startup
        //TODO - handle members leaving 
    }
    help(input) {
        input.channel.send(this.tools.embed.addField("Placeholder", "Placeholder"));
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
        if (input.parts[0] === "spy") {
            offset += input.parts[1].length + 1;
        }
        let track = input.content.substring(offset).toLowerCase();
        const matches = this.tools.getConfigs(input.guild.id)["watch"].data.matches;
        const users = this.tools.getConfigs(input.guild.id)["watch"].data.users;
        const silent = this.tools.getConfigs(input.guild.id)["watch"].data.silent;
        if (matches[track] === undefined) {
            matches[track] = [];
        }
        const id = input.message.member.id;
        const prevTrack = users[id];
        if (prevTrack) {
            if (matches[prevTrack].length === 1) {
                delete matches[prevTrack];
            }
            else {
                matches[prevTrack].splice(matches[prevTrack].findIndex(t => t === id));
            }
        }
        users[id] = track;
        if (input.parts[0] === "spy") {
            input.channel.send(this.tools.embed.addField("Watch", `**${input.message.member.displayName}** is now spying on '${track}'`));
            silent[id] = null;
        }
        else {
            input.channel.send(this.tools.embed.addField("Watch", `**${input.message.member.displayName}** is now watching '${track}'`));
        }
        matches[track].push(id);
        this.tools.markForUpdate(input.guild.id);
        this.buildRegex(input.message);
        this.matches = matches;
        this.silent = silent;
    }
    unwatch(input) {
        const matches = this.tools.getConfigs(input.guild.id)["watch"].data.matches;
        const users = this.tools.getConfigs(input.guild.id)["watch"].data.users;
        const silent = this.tools.getConfigs(input.guild.id)["watch"].data.silent;
        const id = input.message.member.id;
        const prevTrack = users[id];
        if (!prevTrack) {
            return;
        }
        delete users[id];
        delete silent[id];
        if (!matches[prevTrack]) {
            return;
        }
        if (matches[prevTrack].length === 1) {
            delete matches[prevTrack];
        }
        else {
            matches[prevTrack].splice(matches[prevTrack].findIndex(t => t === id));
        }
        this.tools.markForUpdate(input.guild.id);
        input.channel.send(this.tools.embed.addField("Watch", `**${input.message.member.displayName}** is no longer watching '${prevTrack}'`));
        this.buildRegex(input.message);
        this.matches = matches;
        this.silent = silent;
    }
    passive(message) {
        if (!this.regex) {
            this.buildRegex(message);
            this.matches = this.tools.getConfigs(message.guild.id)["watch"].data.matches;
            this.silent = this.tools.getConfigs(message.guild.id)["watch"].data.silent;
        }
        let result;
        const silentUsers = [];
        while (null !== (result = this.regex.exec(message.content))) {
            let embed;
            for (const user of this.matches[result[0]]) {
                if (this.silent[user] === undefined) {
                    silentUsers.push(user);
                }
                else {
                    embed = embed === undefined ? this.tools.embed.setTitle(result[0]).setURL(message.url) : embed;
                    message.guild.members.get(user).send(embed);
                }
            }
        }
        if (silentUsers.length === 0) {
            return;
        }
        message.channel.send("<@" + silentUsers.join("><@") + ">");
    }
    buildRegex(message) {
        let rx = "";
        const matches = this.tools.getConfigs(message.guild.id)["watch"].data.matches;
        for (const track in matches) {
            rx += "|" + track;
        }
        rx = rx.substring(1);
        this.regex = new RegExp(rx, "gi");
    }
}
module.exports = Watch;
//# sourceMappingURL=watch.js.map