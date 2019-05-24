"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const pluginTools_1 = require("./misc/pluginTools");
class PluginManager {
    constructor(exposedFunctions) {
        this.pluginsMap = new Map();
        this.commandMap = new Map();
        this.exposedFunctions = {
            ...exposedFunctions,
            plugins: this.plugins,
            commands: this.commands
        };
        const files = fs_1.readdirSync("src/plugins");
        for (let file of files) {
            file = file.substring(0, file.lastIndexOf("."));
            const PluginFile = require("./plugins/" + file + ".js");
            new PluginFile(new PluginBuilder(this.registerPlugin.bind(this)));
        }
    }
    get plugins() {
        return this.pluginsMap;
    }
    get commands() {
        return this.commandMap;
    }
    registerPlugin(pluginBuilder) {
        if (!pluginBuilder.name) {
            console.log("Failed to initialize plugin without a name.");
            return;
        }
        if (!pluginBuilder.commands || pluginBuilder.commands.length === 0) {
            console.log("Failed to initialize plugin without a command: " + pluginBuilder.name);
            return;
        }
        if (!pluginBuilder.messageHandler) {
            console.log("Failed to initialize plugin without a message handler: " + pluginBuilder.name);
            return;
        }
        if (!pluginBuilder.helpHandler) {
            console.log("Failed to initialize plugin without a help handler: " + pluginBuilder.name);
            return;
        }
        const plugin = {
            name: pluginBuilder.name,
            id: pluginBuilder.commands[0],
            messageHandler: pluginBuilder.messageHandler,
            helpHandler: pluginBuilder.helpHandler,
            commands: pluginBuilder.commands,
            passive: pluginBuilder.passive,
            defaultConfig: pluginBuilder.defaultConfig,
            configCount: Object.keys(pluginBuilder.defaultConfig).length,
            validator: pluginBuilder.validator,
            extendedPermissions: pluginBuilder.extendedPermissions,
            alwaysOn: pluginBuilder.alwaysOn
        };
        for (const command of plugin.commands) {
            this.commandMap.set(command, plugin);
        }
        this.pluginsMap.set(plugin.id, plugin);
        return new pluginTools_1.PluginTools(this.exposedFunctions, plugin);
    }
}
exports.default = PluginManager;
class PluginBuilder {
    constructor(registerFunc) {
        this.passive = false;
        this.defaultConfig = {};
        this.validator = () => false;
        this.extendedPermissions = false;
        this.alwaysOn = false;
        this.registerFunc = registerFunc;
    }
    register() {
        return this.registerFunc(this);
    }
}
exports.PluginBuilder = PluginBuilder;
//# sourceMappingURL=pluginManager.js.map