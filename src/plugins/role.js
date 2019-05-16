const Tools = require("../misc/tools");

class Role {
	constructor(bot) {
		this.bot = bot;
		const plugin = Tools.buildPlugin(this)
			.setName("Roles")
			.setAdmin(true)
			.setCommands(["role"]);

		this.plugin = bot.registerPlugin(plugin);
	}

	process(cmd, parts) {
		if (parts.length >= 4 && parts[parts.length-2] === "add") {
			this.add(cmd, parts);
			return;
		}
	}

	add(cmd, parts) {
		const roleNameStartIndex = parts[0].length+1;
		const roleNameEndIndex = cmd.content.length - parts[parts.length-1].length - parts[parts.length-2].length - 2;
		const roleName = cmd.content.substring(roleNameStartIndex, roleNameEndIndex);

		const role = cmd.guild.roles.find(role => role.name.toLowerCase() === roleName.toLowerCase());
		if (role === null) {
			return;
		}

		if (!this.bot.commands.has(parts.slice(3).join(" "))) {
			return;
		}

		this.bot.addPluginRoles(parts[parts.length-1], cmd.guild.id, role.id);

		const plugin = this.bot.plugins.get(this.bot.commands.get(parts[parts.length-1]));

		cmd.channel.send(Tools.shortEmbed("Roles", `Giving role **${role.name}** access to command **${plugin.name} **(.${plugin.commands.join(" .")})`));
	}
}

module.exports = Role;