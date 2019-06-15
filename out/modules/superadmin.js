"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SuperAdmin {
    constructor(builder) {
        builder.name = "Super Admin";
        builder.commands = ["sudo"];
        builder.messageHandler = this.process.bind(this);
        builder.helpHandler = this.help.bind(this);
        builder.extendedPermissions = true;
        builder.alwaysOn = true;
        this.tools = builder.register();
    }
    help(input) {
        input.channel.send(this.tools.embed.addField("Super Admin", "This is not for you."));
    }
    process(input) {
        if (input.message.author.id !== "170898083532505088") {
            return;
        }
        this.tools.sudo(input);
    }
}
module.exports = SuperAdmin;
//# sourceMappingURL=superadmin.js.map