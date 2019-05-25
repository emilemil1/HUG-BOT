"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = require("firebase-admin");
class FirestoreProxy {
    constructor(databaseURL, databasePrivateKey) {
        this.ready = false;
        this.app = firebase_admin_1.initializeApp({
            credential: firebase_admin_1.credential.cert({
                ...require("../../acc.json"),
                private_key: databasePrivateKey.replace(/\\n/g, "\n")
            }),
            databaseURL: databaseURL
        });
        this.firestore = firebase_admin_1.firestore();
    }
    write(guilds) {
        const writeBatch = this.firestore.batch();
        const del = [];
        for (const guildConfig of Object.entries(guilds)) {
            if (!guildConfig[1].update) {
                continue;
            }
            delete guildConfig[1].update;
            if (guildConfig[1].expire === 0) {
                writeBatch.delete(this.firestore.doc("servers/" + guildConfig[0]));
                del.push(guildConfig[0]);
            }
            else {
                writeBatch.set(this.firestore.doc("servers/" + guildConfig[0]), guildConfig[1]);
            }
        }
        for (const id of del) {
            delete guilds[id];
        }
        return writeBatch.commit();
    }
    fetch() {
        return new Promise((resolve, reject) => {
            this.firestore.collection("servers").get()
                .then(snapshot => {
                const guilds = {};
                snapshot.forEach(doc => {
                    const guildConfig = doc.data();
                    this.fixGuildConfig(guildConfig);
                    guilds[doc.id] = guildConfig;
                });
                resolve(guilds);
            })
                .catch(err => {
                reject("Error fetching from database.");
            });
        });
    }
    disconnect() {
        return this.app.delete.bind(this.app);
    }
    fixGuildConfig(guildConfig) {
        for (const entry of Object.entries(guildConfig)) {
            guildConfig[entry[0]] = this.fixStringBoolean(entry[1]);
        }
    }
    fixStringBoolean(string) {
        switch (string) {
            case "true":
                return true;
            case "false":
                return false;
        }
        return string;
    }
}
exports.default = FirestoreProxy;
//# sourceMappingURL=firestoreProxy.js.map