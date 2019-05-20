import { PluginTools } from "../misc/pluginTools";
import { PluginBuilder } from "../pluginManager";

class SuperAdmin {
	private tools: PluginTools;

	constructor(builder: PluginBuilder) {
		builder.name = "Super Admin";
		builder.commands = ["sudo"];
		builder.handler = this.process.bind(this);
		builder.extendedPermissions = true;
		builder.alwaysOn = true;
		this.tools = builder.register();
	}

	process(input: Input) {
		if (input.message.author.id !== "170898083532505088") {
			return;
		}
		this.tools.sudo(input);
	}
}

module.exports = SuperAdmin;