"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DatabaseSync {
    static syncDatabase(remoteGuilds, localGuilds, plugins) {
        const expire = [];
        const active = [];
        //Iterate over local guilds
        for (const localGuildID in localGuilds) {
            //Collect guilds missing from remote
            if (!remoteGuilds.has(localGuildID)) {
                expire.push(localGuildID);
            }
        }
        //Expire guilds missing from remote
        const now = Date.now();
        for (const guildID of expire) {
            if (localGuilds[guildID].expire === undefined) {
                localGuilds[guildID].expire = now + 86400000;
            }
            else {
                if (now > localGuilds[guildID].expire) {
                    localGuilds[guildID].expire = 0;
                }
            }
            localGuilds[guildID].update = true;
        }
        //Iterate over remote guilds
        for (const activeGuildID of remoteGuilds.keys()) {
            //Create guilds missing from local
            if (!localGuilds[activeGuildID]) {
                localGuilds[activeGuildID] = this.createNewGuild(plugins);
            }
            //Collect active guilds
            active.push({
                local: localGuilds[activeGuildID],
                remote: remoteGuilds.get(activeGuildID)
            });
        }
        //Iterate over active guilds
        for (const guild of active) {
            //Iterate over remote roles
            for (const remoteRole of guild.remote.roles.keys()) {
                //Create roles missing from local
                if (!guild.local.roles[remoteRole]) {
                    guild.local.roles[remoteRole] = {};
                    guild.local.update = true;
                    continue;
                }
                const removePlugins = [];
                //Iterate over plugins in local role
                for (const pluginID in guild.local.roles[remoteRole]) {
                    //Collect plugins that no longer exist
                    if (!plugins.has(pluginID)) {
                        removePlugins.push(pluginID);
                    }
                }
                //Remove plugins that no longer exist
                for (const pluginID of removePlugins) {
                    delete guild.local.roles[remoteRole][pluginID];
                    guild.local.RPInstances[pluginID]--;
                    guild.local.update = true;
                }
            }
            const deleteRoles = [];
            //Iterate over local roles
            for (const localRole in guild.local.roles) {
                //Collect roles missing from remote
                if (!guild.remote.roles.has(localRole)) {
                    deleteRoles.push(localRole);
                }
            }
            //Remove roles missing from remote
            for (const localRoleID of deleteRoles) {
                for (const pluginID in guild.local.roles[localRoleID]) {
                    guild.local.RPInstances[pluginID]--;
                }
                delete guild.local.roles[localRoleID];
                guild.local.update = true;
            }
            //Collect plugins that no longer exist from instances
            const deleteInstances = [];
            for (const pluginID in guild.local.RPInstances) {
                if (guild.local.RPInstances[pluginID] === 0) {
                    deleteInstances.push(pluginID);
                }
            }
            //Delete plugins that no longer exist from instances
            for (const pluginID of deleteInstances) {
                delete guild.local.RPInstances[pluginID];
                guild.local.update = true;
            }
            //Iterate over local plugins
            const removePlugins = [];
            for (const pluginID in guild.local.plugins) {
                //Collect plugins that no longer exist
                if (!plugins.has(pluginID)) {
                    removePlugins.push(pluginID);
                }
            }
            //Remove plugins that no longer exist
            for (const pluginID of removePlugins) {
                delete guild.local.plugins[pluginID];
                guild.local.update = true;
            }
            //Iterate over loaded plugins
            for (const plugin of plugins.values()) {
                //Create plugins missing from local
                if (!guild.local.plugins[plugin.id]) {
                    guild.local.plugins[plugin.id] = {};
                    for (const def in plugin.defaultConfig) {
                        guild.local.plugins[plugin.id][def] = plugin.defaultConfig[def].value;
                    }
                    if (!plugin.alwaysOn) {
                        guild.local.plugins[plugin.id].status = "false";
                    }
                    guild.local.update = true;
                }
            }
        }
    }
    static createNewGuild(plugins) {
        return {
            plugins: this.getPluginDefaults(plugins),
            roles: {},
            RPInstances: {},
            update: true
        };
    }
    static getPluginDefaults(plugins) {
        const newPlugins = {};
        for (const plugin of plugins.values()) {
            newPlugins[plugin.id] = {};
            for (const def in plugin.defaultConfig) {
                newPlugins[plugin.id][def] = plugin.defaultConfig[def].value;
            }
            if (!plugin.alwaysOn) {
                newPlugins[plugin.id].status = "false";
            }
        }
        return newPlugins;
    }
}
exports.DatabaseSync = DatabaseSync;
//# sourceMappingURL=dbSync.js.map