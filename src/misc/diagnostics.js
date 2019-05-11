class Diagnostics {

	static diagnoseLogin(client, error) {
		console.error("\n|| Running Login Diagnostics ||\n");
		if (Diagnostics.verifyToken(client.token, error)) return;
	}

	static verifyToken(token, error) {
		process.stdout.write("Verifying token... ");
		if (error === "Incorrect login details were provided." || token === "") {
			process.stdout.write("Failed!\n");
			console.error("The login token seems to be invalid. Please rebuild the bot with a valid token using {node ./scripts/build -s}\n");
			return true;
		}
		return false;
	}

}

module.exports = Diagnostics;