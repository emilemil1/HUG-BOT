"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Role {
    constructor(builder) {
        builder.name = "Role Permissions";
        builder.commands = ["role", "roles"];
        builder.handler = this.process.bind(this);
        builder.extendedPermissions = true;
        builder.alwaysOn = true;
        this.tools = builder.register();
        //TODO - handle role events
    }
    process(input) {
        if (input.parts.length >= 4 && input.parts[input.parts.length - 2] === "add") {
            this.add(input);
            return;
        }
        if (input.parts.length >= 4 && input.parts[input.parts.length - 2] === "remove") {
            this.remove(input);
            return;
        }
        if (input.parts.length >= 2) {
            this.listSingle(input);
            return;
        }
        if (input.parts.length === 1) {
            this.listAll(input);
            return;
        }
    }
    listAll(input) {
        const roles = input.guild.roles;
        let embed = this.tools.embed;
        roles.forEach(role => {
            if (role.name !== "@everyone") {
                let reply = "";
                const localRole = this.tools.getRoles(input.guild.id)[role.id];
                if (localRole) {
                    for (const pluginID in localRole) {
                        const plugin = this.tools.plugins.get(pluginID);
                        reply += `**${plugin.name}** (.${plugin.commands.join(" .")})\n`;
                    }
                    embed.addField(`${role.name}`, reply === "" ? "n/a" : reply);
                }
            }
        });
        input.channel.send(embed.setTitle("Role Permissions"));
    }
    listSingle(input) {
        const role = input.guild.roles.find(r => r.name.toLowerCase() === input.content.substring(input.parts[0].length + 1).toLowerCase());
        if (!role) {
            return;
        }
        const localRole = this.tools.getRoles(input.guild.id)[role.id];
        if (!localRole) {
            return;
        }
        let reply = "";
        for (const pluginID in localRole) {
            const plugin = this.tools.plugins.get(pluginID);
            reply += `**${plugin.name}** (.${plugin.commands.join(" .")})\n`;
        }
        input.channel.send(this.tools.embed.addField(`Role Permissions - ${role.name}`, reply === "" ? "n/a" : reply));
    }
    remove(input) {
        const ext = this.extract(input);
        if (!ext) {
            return;
        }
        if (!ext.roles[ext.plugin.id]) {
            return;
        }
        delete ext.roles[ext.plugin.id];
        const instances = this.tools.getRoles(input.guild.id)._instances;
        instances[ext.plugin.id]--;
        if (instances[ext.plugin.id] === 0) {
            delete instances[ext.plugin.id];
        }
        input.channel.send(this.tools.embed.addField("Roles", `Revoking role **${ext.role.name}** access to plugin **${ext.plugin.name} **(.${ext.plugin.commands.join(" .")})`));
    }
    add(input) {
        const ext = this.extract(input);
        if (!ext) {
            return;
        }
        if (ext.roles[ext.plugin.id]) {
            return;
        }
        ext.roles[ext.plugin.id] = undefined;
        const instances = this.tools.getRoles(input.guild.id)._instances;
        if (instances[ext.plugin.id] === undefined) {
            instances[ext.plugin.id] = 0;
        }
        instances[ext.plugin.id]++;
        input.channel.send(this.tools.embed.addField("Roles", `Giving role **${ext.role.name}** access to plugin **${ext.plugin.name} **(.${ext.plugin.commands.join(" .")})`));
    }
    extract(input) {
        const roleNameStartIndex = input.parts[0].length + 1;
        const roleNameEndIndex = input.content.length - input.parts[input.parts.length - 1].length - input.parts[input.parts.length - 2].length - 2;
        const roleName = input.content.substring(roleNameStartIndex, roleNameEndIndex);
        const role = input.guild.roles.find(role => role.name.toLowerCase() === roleName.toLowerCase());
        if (role === null) {
            return;
        }
        const plugin = this.tools.plugins.get(input.parts[input.parts.length - 1]);
        if (!plugin) {
            return;
        }
        const roles = this.tools.getRoles(input.guild.id)[roleName];
        if (!roles) {
            return;
        }
        return {
            roles: roles,
            role: role,
            plugin: plugin
        };
    }
}
module.exports = Role;
//# sourceMappingURL=role.js.map