"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Config {
    constructor(builder) {
        builder.name = "Configuration";
        builder.commands = ["config"];
        builder.handler = this.process.bind(this);
        builder.extendedPermissions = true;
        builder.alwaysOn = true;
        this.tools = builder.register();
    }
    process(message) {
        if (message.parts.length === 1) {
            this.listAll(message);
            return;
        }
        if (message.parts.length === 2) {
            this.listSingle(message);
            return;
        }
        if (message.parts.length === 3) {
            message.parts.push(message.parts[2]);
            message.parts[2] = "status";
            this.setSingle(message);
            return;
        }
        if (message.parts.length === 4) {
            this.setSingle(message);
            return;
        }
    }
    setSingle(input) {
        const plugin = this.tools.plugins.get(input.parts[1]);
        if (!plugin) {
            return;
        }
        const config = this.tools.getConfigs(input.guild.id)[plugin.id];
        if (!config[input.parts[2]]) {
            return;
        }
        const newValue = Config.import(input.parts[3]);
        if (newValue === config[input.parts[2]]) {
            return;
        }
        if (input.parts[2] === "status") {
            if (!Config.statusValidator(newValue)) {
                input.channel.send(this.tools.embed.addField(plugin.name, `**${plugin.name}** cannot be set to '${input.parts[3]}'`));
                return;
            }
            input.channel.send(this.tools.embed.addField(plugin.name, `**${plugin.name}** has ${Config.export(newValue).has}`));
        }
        else {
            if (!plugin.validator(input.parts[2], newValue)) {
                input.channel.send(this.tools.embed.addField(plugin.name, `**${input.parts[2].charAt(0).toUpperCase()}${input.parts[2].substring(1)}** cannot be set to '${input.parts[3]}'`));
                return;
            }
            input.channel.send(this.tools.embed.addField(plugin.name, `**${input.parts[2].charAt(0).toUpperCase()}${input.parts[2].substring(1)}** has ${Config.export(newValue).has}`));
        }
        config[input.parts[2]] = newValue;
        this.tools.markForUpdate(input.guild.id);
    }
    listSingle(input) {
        const plugin = this.tools.plugins.get(input.parts[1]);
        if (!plugin) {
            return;
        }
        if (plugin.alwaysOn && plugin.configCount === 0) {
            return;
        }
        const config = this.tools.getConfigs(input.guild.id)[plugin.id];
        let reply = "";
        for (const option of Object.entries(config)) {
            reply += `**${option[0].charAt(0).toUpperCase()}${option[0].substring(1)}** : ${Config.export(option[1]).text}`;
        }
        input.channel.send(this.tools.embed.addField(plugin.name, reply));
    }
    listAll(input) {
        let reply = "";
        //TODO - Show plugins with extended permission first and separately
        //TODO - Add instructions
        //TODO - Sort
        for (const plugin of Array.from(this.tools.plugins.values()).filter(p => !p.alwaysOn || p.configCount > 0).sort()) {
            reply += `**${plugin.name}** (.${plugin.commands.join(" .")})\n`;
        }
        input.channel.send(this.tools.embed.addField("Configuration", reply));
    }
    static export(value) {
        switch (value) {
            case "true":
                return {
                    value: "true",
                    text: "enabled",
                    has: "been enabled"
                };
            case "false":
                return {
                    value: "false",
                    text: "disabled",
                    has: "been disabled"
                };
        }
        return {
            value: value,
            text: value,
            has: "been set to " + value
        };
    }
    static import(value) {
        switch (value) {
            case "on":
            case "enable":
            case "enabled":
                return "true";
            case "off":
            case "disable":
            case "disable":
                return "false";
        }
        return value;
    }
    static statusValidator(value) {
        if (value === "true" || value === "false") {
            return true;
        }
        return false;
    }
}
module.exports = Config;
//# sourceMappingURL=config.js.map