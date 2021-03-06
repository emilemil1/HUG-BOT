"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Nickname {
    constructor(builder) {
        builder.name = "BOT Nickname";
        builder.commands = ["nick", "nickname"];
        builder.messageHandler = this.process.bind(this);
        builder.helpHandler = this.help.bind(this);
        builder.extendedPermissions = true;
        builder.alwaysOn = true;
        this.tools = builder.register();
    }
    help(input) {
        input.channel.send(this.tools.embed.addField("Placeholder", "Placeholder"));
    }
    process(input) {
        if (input.parts.length === 1) {
            return;
        }
        const nickname = input.content.substring(input.parts[0].length + 1);
        input.guild.member(this.tools.client.user).setNickname(nickname);
        input.channel.send(this.tools.embed.addField("BOT Nickname", `Bot nickname changed to '${nickname}'`));
    }
}
module.exports = Nickname;
//# sourceMappingURL=nick.js.map