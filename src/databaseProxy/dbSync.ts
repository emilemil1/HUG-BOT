import { Guild, Snowflake, Collection, Message } from "discord.js";

export class DatabaseSync {
	static syncDatabase(remoteGuilds: Collection<Snowflake, Guild>, localGuilds: Guilds, plugins: Map<string, BotPlugin>) {
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
			} else {
				if (now > localGuilds[guildID].expire!) {
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
				remote: remoteGuilds.get(activeGuildID)!
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
					guild.local.RPInstances[pluginID]!--;
					guild.local.update = true;
				}
			}
			const deleteRoles = [];
			//Iterate over local roles
			for (const localRole in guild.local.roles) {
				//Collect roles missing from remote
				if (!guild.remote.roles.has(localRole)) {
					deleteRoles.push(localRole)
				}
			}
			//Remove roles missing from remote
			for (const localRoleID of deleteRoles) {
				for (const pluginID in guild.local.roles[localRoleID]) {
					guild.local.RPInstances[pluginID]!--;
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
				if (!plugin.config && !plugin.data) {
					delete guild.local.plugins[plugin.id];
					continue;
				}
				if (!guild.local.plugins[plugin.id]) {
					guild.local.plugins[plugin.id] = {};
				}
				if (plugin.config) {
					guild.local.plugins[plugin.id].config = DatabaseSync.replicate(guild.local.plugins[plugin.id].config, plugin.config, guild.local, plugin.id + ".config");
				} else {
					delete guild.local.plugins[plugin.id].config;
				}
				if (plugin.data) {
					guild.local.plugins[plugin.id].data = DatabaseSync.replicate(guild.local.plugins[plugin.id].data, plugin.data, guild.local, plugin.id + ".data");
				} else {
					delete guild.local.plugins[plugin.id].data;
				}
			}
		}
	}

	private static createNewGuild(plugins: Map<string, BotPlugin>) {
		return {
			plugins: {},
			roles: {},
			RPInstances: {},
			update: true
		};
	}

	private static replicate(destination: any, source: any, guild: GuildConfig, path: string) {
		//Undefined
		if (source === undefined) {
			if (destination === undefined) {
				return undefined;
			}

			return destination;
		}

		//Primitives
		if (source === null || typeof source !== "object") {
			if (destination === undefined || typeof destination !== typeof source) {
				guild.update = true;
				return source;
			}

			return destination;
		}

		//Objects
		if (!Array.isArray(source)) {
			if (typeof destination !== "object" || Array.isArray(destination)) {
				guild.update = true;
			} else {
				for (const destProp in destination) {
					if (source[destProp] === undefined) {
						guild.update = true;
						break;
					}
				}
			}

			let counter = 0;
			const newProp: any = {};
			for (const sourceProp in source) {
				counter++;
				newProp[sourceProp] = DatabaseSync.replicate(destination ? destination[sourceProp] : undefined, source[sourceProp], guild, path + "." + sourceProp);
			}
			if (counter === 0 && destination) {
				for (const destProp in destination) {
					newProp[destProp] = destination[destProp];
				}
			}
			return newProp;
		}

		//Arrays
		if (!Array.isArray(destination) || source.length !== destination.length) {
			guild.update = true;
		}

		const newArr: any = [];
		for (let i = 0; i < source.length; i++) {
			newArr.push(DatabaseSync.replicate(destination ? destination[i] : undefined, source[i], guild, path + "["+i+"]"));
		}
		return newArr;
	}
}