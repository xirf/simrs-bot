import server, { apiRoutes } from "./libs/server";
import client from "./libs/whatsapp/client";
import CronJob from "./libs/cronjob/worker"
import pino from "./libs/logger";
import routesParser from "./utils/routesParser";

require("dotenv").config();

const start = async () => {
	await client.connect();
	await server().ready()
	apiRoutes(server())


	CronJob()


	client.on('messagesUpsert', async (message) => {
		try {
			routesParser(message)
		} catch (error) {
			pino.error(error, "Something went wrong when handling the message")
		}
	})


	server().listen({ port: 3000, }, (err, address) => {
		if (err) {
			pino.fatal(err, "Failed to start server");
			process.exit(1);
		}
	});
}


start();
