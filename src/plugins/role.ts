import { PluginBuilder } from "../pluginManager";
import { PluginTools } from "../misc/pluginTools";

class Role {
	private tools: PluginTools

	constructor(builder: PluginBuilder) {
		builder.name = "Role Permissions";
		builder.commands = ["role", "roles"];
		builder.messageHandler = this.process.bind(this);
		builder.helpHandler = this.help.bind(this);
		builder.extendedPermissions = true;
		builder.alwaysOn = true;
		this.tools = builder.register();

		//TODO - handle role events
	}

	help(input: Input) {
		input.channel.send(this.tools.embed.addField("Placeholder", "Placeholder"));
	}

	process(input: Input) {
		if (input.parts.length >= 4 && input.parts[input.parts.length-2] === "add") {
			this.add(input);
			return;
		}
		if (input.parts.length >= 4 && input.parts[input.parts.length-2] === "remove") {
			this.remove(input);
			return;
		}
		if (input.parts.length === 1) {
			this.listAll(input)
			return;
		}
		this.listSingle(input);
	}

	listAll(input: Input) {
		const roles = input.guild.roles;

		if (Object.keys(roles).length === 1) {
			return;
		}

		let embed = this.tools.embed;
		roles.forEach(role => {
			if (role.name !== "@everyone") {
				let reply = "";
				const localRole = this.tools.getRoles(input.guild.id)[role.id]
				if (localRole) {
					for (const pluginID in localRole) {
						const plugin = this.tools.plugins.get(pluginID)!;
						reply += `**${plugin.name}** (.${plugin.commands.join(" .")})\n`;
					}
					embed.addField(`${role.name}`, reply === "" ? "None" : reply);
				}
			}
			
		})
		input.channel.send(embed.setTitle("Role Permissions"));
	}

	listSingle(input: Input) {
		const role = input.guild.roles.find(r => r.name.toLowerCase() === input.content.substring(input.parts[0].length+1).toLowerCase());
		if (!role) {
			this.listSinglePlugin(input);
			return;
		}
		const localRole = this.tools.getRoles(input.guild.id)[role.id]
		if (!localRole) {
			return;
		}

		let reply = "";
		for (const pluginID in localRole) {
			const plugin = this.tools.plugins.get(pluginID)!;
			reply += `**${plugin.name}** (.${plugin.commands.join(" .")})\n`;
		}
		input.channel.send(this.tools.embed.addField(`Role Permissions: ${role.name}`, reply === "" ? "None" : reply));
	}

	listSinglePlugin(input: Input) {
		const plugin = input.content.substring(input.parts[0].length+1).toLowerCase();
		const plug = this.tools.plugins.get(plugin);
		if (!plug) {
			return;
		}
		if (!this.tools.getRolePluginCounts(input.guild.id)[plugin]) {
			if (plug.extendedPermissions) {
				input.channel.send(this.tools.embed.addField(`Role Permissions: ${plug.name}`, "Available to server owner."));
			} else {
				input.channel.send(this.tools.embed.addField(`Role Permissions: ${plug.name}`, "Available to all users."));
			}
			return;
		}
		const roles = this.tools.getRoles(input.guild.id);
		let reply = "";

		for (const role of Object.entries(roles)) {
			if (!role[1][plugin]) {
				continue;
			}
			reply += `${role[0]}\n`;
		}
		input.channel.send(this.tools.embed.addField(`Role Permissions: ${plug.name}`, reply));
	}

	remove(input: Input) {
		const ext = this.extract(input);
		if (!ext) {
			return;
		}
		if (ext.roles[ext.plugin.id] === undefined) {
			return;
		}

		delete ext.roles[ext.plugin.id];
		const instances = this.tools.getRolePluginCounts(input.guild.id);
		instances[ext.plugin.id]!--
		if (instances[ext.plugin.id] === 0) {
			delete instances[ext.plugin.id];
		}
		this.tools.markForUpdate(input.guild.id);

		input.channel.send(this.tools.embed.addField("Roles", `Revoking role **${ext.role.name}** access to plugin **${ext.plugin.name}**`));
	}

	add(input: Input) {
		const ext = this.extract(input);
		if (!ext) {
			return;
		}
		if (ext.roles[ext.plugin.id] === undefined) {
			return;
		}

		ext.roles[ext.plugin.id] = null;
		const instances = this.tools.getRolePluginCounts(input.guild.id);
		if (instances[ext.plugin.id] === undefined) {
			instances[ext.plugin.id] = 0;
		}
		instances[ext.plugin.id]!++
		this.tools.markForUpdate(input.guild.id);

		input.channel.send(this.tools.embed.addField("Roles", `Giving role **${ext.role.name}** access to plugin **${ext.plugin.name}**`));
	}

	private extract(input: Input) {
		const roleNameStartIndex = input.parts[0].length+1;
		const roleNameEndIndex = input.content.length - input.parts[input.parts.length-1].length - input.parts[input.parts.length-2].length - 2;
		const roleName = input.content.substring(roleNameStartIndex, roleNameEndIndex);

		const role = input.guild.roles.find(role => role.name.toLowerCase() === roleName.toLowerCase());
		if (role === null) {
			return;
		}

		const plugin = this.tools.plugins.get(input.parts[input.parts.length-1]);
		if (!plugin) {
			return;
		}

		const roles = this.tools.getRoles(input.guild.id)[role.id];
		if (!roles) {
			return;
		}

		return {
			roles: roles,
			role: role,
			plugin: plugin
		}
	}
}

module.exports = Role;