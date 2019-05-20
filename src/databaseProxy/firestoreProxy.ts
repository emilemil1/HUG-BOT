import { initializeApp, credential, firestore, app } from "firebase-admin";

export default class FirestoreProxy implements DatabaseProxy {
	private firestore: firestore.Firestore;
	private app: app.App;
	ready: boolean = false;

	constructor(databaseURL: string, databasePrivateKey: string) {
		this.app = initializeApp({
			credential: credential.cert({
				...require("../../acc.json"),
				private_key: databasePrivateKey.replace(/\\n/g, "\n")
			}),
			databaseURL: databaseURL
		})
		this.firestore = firestore();
	}

	write(guilds: Guilds) {
		const writeBatch = this.firestore.batch();
		const del = [];
		for (const guildConfig of Object.entries(guilds)) {
			if (!guildConfig[1].update) {
				continue;
			}
			delete guildConfig[1].update
			if (guildConfig[1].expire === 0) {
				writeBatch.delete(this.firestore.doc("servers/"+guildConfig[0]));
				del.push(guildConfig[0]);
			} else {
				writeBatch.set(this.firestore.doc("servers/"+guildConfig[0]), guildConfig[1], {merge: true});
			}
		}
		for (const id of del) {
			delete guilds[id];
		}
		return writeBatch.commit();
	}

	fetch(): Promise<Guilds> {
		return new Promise((resolve, reject) => {
			this.firestore.collection("servers").get()
				.then(snapshot => {
					const guilds: Guilds = {};
					snapshot.forEach(doc => {
						const guildConfig = doc.data() as GuildConfig;
						this.fixGuildConfig(guildConfig);
						guilds[doc.id] = guildConfig;
					});
					resolve(guilds);
				})
				.catch(err => {
					reject("Error fetching from database.");
				});
		})
	}

	disconnect() {
		return this.app.delete.bind(this.app);
	}

	private fixGuildConfig(guildConfig: GuildConfig) {
		for (const entry of Object.entries(guildConfig)) {
			guildConfig[entry[0]] = this.fixStringBoolean(entry[1]);
		}
	}
	
	private fixStringBoolean(string: string) {
		switch (string) {
		case "true":
			return true;
		case "false":
			return false;	
		}
		return string;
	}
	
}