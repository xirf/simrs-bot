import server, { apiRoutes } from "./libs/server";
import client from "./libs/whatsapp/client";
import CronJob from "./libs/cronjob/worker"

import { hello } from "./libs/commands";
import pino from "./libs/logger";

require("dotenv").config();

const start = async () => {
	await client.connect();
	await server().ready()
	apiRoutes(server())


	CronJob()


	client.on('messagesUpsert', async (m) => {
		try {
			// handle message

		} catch (error) {
			// if error
		}
	})


	server().listen({ port: 3000, }, (err, address) => {
		if (err) {
			pino.info("Failed to start server")
			pino.fatal(err);
			process.exit(1);
		}
	});
}


start();
