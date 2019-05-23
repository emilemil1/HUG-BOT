"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class PluginTools {
    constructor(functions, plugin) {
        this.plugin = plugin;
        this.functions = functions;
    }
    get embed() {
        return new discord_js_1.RichEmbed().setColor(PluginTools.color);
    }
    getConfigs(guildID) {
        return this.functions.getConfigs(guildID);
    }
    get plugins() {
        return this.functions.plugins;
    }
    get client() {
        return this.functions.client;
    }
    getRoles(guildID) {
        return this.functions.getRoles(guildID);
    }
    getRolePluginCounts(guildID) {
        return this.functions.getRolePluginCounts(guildID);
    }
    markForUpdate(guildID) {
        this.functions.markForUpdate(guildID);
    }
    sudo(input) {
        this.functions.sudo(input);
    }
    getBotConfig() {
        return this.functions.getBotConfig();
    }
}
PluginTools.color = "#23A5E3";
exports.PluginTools = PluginTools;
//# sourceMappingURL=pluginTools.js.map