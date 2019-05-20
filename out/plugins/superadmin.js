"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SuperAdmin {
    constructor(builder) {
        builder.name = "Super Admin";
        builder.commands = ["sudo"];
        builder.handler = this.process.bind(this);
        builder.extendedPermissions = true;
        builder.alwaysOn = true;
        this.tools = builder.register();
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