"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Watch {
    constructor(builder) {
        builder.name = "Watch";
        builder.commands = ["watch", "unwatch"];
        builder.messageHandler = this.process.bind(this);
        builder.helpHandler = this.help.bind(this);
        builder.extendedPermissions = false;
        builder.passive = true;
        builder.data = {
            matches: {},
            users: {}
        };
        this.tools = builder.register();
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
        let track = input.content.substring(input.parts[0].length + 1);
        const matches = this.tools.getConfigs(input.guild.id)["watch"].data.matches;
        const users = this.tools.getConfigs(input.guild.id)["watch"].data.users;
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
        matches[track].push(id);
    }
    unwatch(input) {
    }
}
module.exports = Watch;
//# sourceMappingURL=monitor.js.map