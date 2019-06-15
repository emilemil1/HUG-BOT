const TranslationServiceClient = require('@google-cloud/translate').v3beta1.TranslationServiceClient;

export default class GoogleCloudProxy {
	translationClient: any;

	constructor(privateKey: string) {
		const credentials =  {
			...require("../../googlecloud-acc.json"),
			private_key: privateKey.replace(/\\n/g, "\n")
		}
		this.translationClient = new TranslationServiceClient({
			credentials: credentials
		});

		this.translationClient.translateText({
			contents: ["hello"],
			targetLanguageCode: "sv",
		}).then((responses: string[]) => {
			console.log(responses[0]);
		})
	}

	disconnect() {
	}
}