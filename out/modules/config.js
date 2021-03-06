"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Config {
    constructor(builder) {
        builder.name = "Configuration";
        builder.commands = ["config"];
        builder.messageHandler = this.process.bind(this);
        builder.helpHandler = this.help.bind(this);
        builder.extendedPermissions = true;
        builder.alwaysOn = true;
        this.tools = builder.register();
    }
    help(input) {
        const description = `
		Configure other modules.
		⠀
		`;
        const showConfig = `
		\`\`\`.config [command]\`\`\`
		`;
        const enableDisableModule = `
		\`\`\`.config [command] [on/off]\`\`\`
		`;
        const setConfiguration = `
		\`\`\`.config [command] [configuration] [value]\`\`\`
		`;
        input.channel.send(this.tools.embed.addField("Help", description).addField("Show Current Module Configurations", showConfig).addField("Enable/Disable Module", enableDisableModule).addField("Set Module Configuration", setConfiguration));
    }
    process(input) {
        if (input.parts.length === 1) {
            this.help(input);
            return;
        }
        if (input.parts.length === 2) {
            this.listSingle(input);
            return;
        }
        if (input.parts.length === 3) {
            input.parts.push(input.parts[2]);
            input.parts[2] = "status";
            this.setSingle(input);
            return;
        }
        if (input.parts.length === 4) {
            this.setSingle(input);
            return;
        }
    }
    setSingle(input) {
        const plugin = this.tools.plugins.get(input.parts[1]);
        if (!plugin) {
            return;
        }
        const pluginConfig = this.tools.getConfigs(input.guild.id)[plugin.id];
        if (!pluginConfig) {
            return;
        }
        const config = pluginConfig.config;
        if (!config || !config[input.parts[2]]) {
            return;
        }
        const newValue = Config.import(input.parts[3], config[input.parts[2]]);
        if (newValue === undefined) {
            input.channel.send(this.tools.embed.addField(plugin.name, `**${input.parts[2].charAt(0).toUpperCase()}${input.parts[2].substring(1)}** cannot be set to '${input.parts[3]}'`));
            return;
        }
        if (input.parts[2].toLowerCase() === "status") {
            input.channel.send(this.tools.embed.addField(plugin.name, `**${plugin.name}** has ${Config.export(newValue).has}`));
        }
        else {
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
        const pluginConfig = this.tools.getConfigs(input.guild.id)[plugin.id];
        if (!pluginConfig) {
            return;
        }
        const config = pluginConfig.config;
        if (!config) {
            return;
        }
        let reply = "";
        for (const option of Object.entries(config)) {
            reply += `**${option[0].charAt(0).toUpperCase()}${option[0].substring(1)}** : ${Config.export(option[1]).text}`;
        }
        input.channel.send(this.tools.embed.addField(plugin.name, reply));
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
    static import(value, oldValue) {
        if (value === oldValue) {
            return undefined;
        }
        if (oldValue === "true" || oldValue === "false") {
            return Config.importBoolean(value);
        }
        if (Number(oldValue) != NaN) {
            return Config.importNumber(value);
        }
        return value;
    }
    static importBoolean(value) {
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
        return undefined;
    }
    static importNumber(value) {
        if (Number(value) === NaN) {
            return undefined;
        }
        return Number(value).toString();
    }
}
module.exports = Config;
//# sourceMappingURL=config.js.map