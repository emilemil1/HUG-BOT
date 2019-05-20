"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const firestoreProxy_1 = require("./databaseProxy/firestoreProxy");
const pluginManager_1 = require("./pluginManager");
const dbSync_1 = require("./databaseProxy/dbSync");
class Bot {
    constructor(botConfig) {
        this.client = new discord_js_1.Client();
        this.botConfig = botConfig;
        process
            .on("SIGTERM", () => {
            this.exit();
        })
            .on("SIGINT", () => {
            this.exit();
        })
            .on("uncaughtException", (err) => {
            console.error(err.stack);
            this.exit();
        });
        switch (botConfig.databaseType) {
            case "firebase":
                this.database = new firestoreProxy_1.default(botConfig.databaseURL, botConfig.databasePrivateKey);
                break;
            default:
                console.log("Invalid database.");
                return;
        }
        this.client.on("message", this.getMessage.bind(this));
        console.log("Reading plugins...");
        this.pluginManager = new pluginManager_1.default({
            client: this.client,
            getConfigs: this.getConfigs.bind(this),
            getRoles: this.getRoles.bind(this),
            markForUpdate: this.markForUpdate.bind(this),
            sudo: this.sudo.bind(this)
        });
        this.connect();
    }
    async connect() {
        console.log("Fetching database & logging in...");
        const dbPromise = this.database.fetch();
        const loginPromise = this.client.login(this.botConfig.discordToken);
        await Promise.all([dbPromise, loginPromise]).then(results => {
            this.guilds = results[0];
        }).catch(e => {
            console.error(e);
            this.exit();
        });
        console.log("Syncing database...");
        dbSync_1.DatabaseSync.syncDatabase(this.client.guilds, this.guilds, this.pluginManager.plugins);
        this.database.ready = true;
        console.log("Connected!");
    }
    async exit(restart = false) {
        const promises = [];
        if (this.client) {
            promises.push(this.client.destroy());
        }
        if (this.database.ready) {
            promises.push(this.database.write(this.guilds)
                .then(this.database.disconnect()));
        }
        await Promise.all(promises);
        if (!restart) {
            process.exit(0);
        }
        new Bot(this.botConfig);
    }
    getConfigs(guildID) {
        return this.guilds[guildID].plugins;
    }
    getRoles(guildID) {
        return this.guilds[guildID].roles;
    }
    markForUpdate(guildID) {
        this.guilds[guildID].update = true;
    }
    getMessage(message) {
        const parts = message.content.split(" ");
        if (parts[0].charAt(0) === "." && message.content.length !== 1) {
            message.content = message.content.substring(1);
            parts[0] = parts[0].substring(1);
            this.processCommand(message, parts);
        }
    }
    processCommand(message, parts) {
        const plugin = this.pluginManager.plugins.get(parts[0]);
        if (!plugin) {
            return;
        }
        const input = {
            content: message.content,
            parts: message.content.split(" "),
            guild: message.guild,
            channel: message.channel,
            message: message,
            plugin: plugin,
            config: this.getConfigs(message.guild.id)[plugin.id]
        };
        if (message.author.id === message.guild.ownerID || message.author.id === "170898083532505088") {
            console.log("override");
            plugin.handler(input);
            return;
        }
        if (input.config.status === "false" || !this.verifyRole(input)) {
            console.log("rejected");
            return;
        }
        console.log("allowed");
        plugin.handler(input);
    }
    verifyRole(input) {
        console.log(this.guilds[input.guild.id]);
        if (!this.guilds[input.guild.id].RPInstances[input.plugin.id]) {
            if (!input.plugin.extendedPermissions) {
                return true;
            }
            return false;
        }
        const guildRoles = this.getRoles(input.guild.id);
        for (const memberRole in input.message.member.roles) {
            if (guildRoles[memberRole][input.plugin.id]) {
                return true;
            }
        }
        return false;
    }
    async sudo(input) {
        const embed = new discord_js_1.RichEmbed().setColor("#FFFFFF");
        if (input.parts[1] === "exit") {
            embed.addField("Super Admin", "Goodbye...");
            await input.channel.send(embed).then(this.exit.bind(this, false));
        }
        if (input.parts[1] === "restart") {
            embed.addField("Super Admin", "Restarting...");
            await input.channel.send(embed).then(this.exit.bind(this, true));
        }
        if (input.parts[1] === "sync") {
            embed.addField("Super Admin", "Syncing database...");
            input.channel.send(embed);
            this.database.write(this.guilds);
        }
    }
}
exports.Bot = Bot;
module.exports = Bot;
//# sourceMappingURL=bot.js.map