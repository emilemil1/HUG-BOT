"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TranslationServiceClient = require('@google-cloud/translate').v3beta1.TranslationServiceClient;
class GoogleCloudProxy {
    constructor(privateKey) {
        const credentials = {
            ...require("../../googlecloud-acc.json"),
            private_key: privateKey.replace(/\\n/g, "\n")
        };
        this.translationClient = new TranslationServiceClient({
            credentials: credentials
        });
        this.translationClient.translateText({
            contents: ["hello"],
            targetLanguageCode: "sv",
        }).then((responses) => {
            console.log(responses[0]);
        });
    }
    disconnect() {
    }
}
exports.default = GoogleCloudProxy;
//# sourceMappingURL=googlecloudProxy.js.map