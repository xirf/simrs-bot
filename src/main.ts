import { hello } from "./libs/commands";
import server, { apiRoutes } from "./libs/server";
import client from "./libs/whatsapp/client";
import { writeFileSync } from 'fs'
import CronJob from "./libs/cronjob/worker"

const start = async () => {
	await client.connect();
	await server().ready()
	CronJob()

	let mid = 0

	client.on('messagesUpsert', async (m) => {
		writeFileSync(`dump/mid_${mid}.json`, JSON.stringify(m, null, 2))
		mid++;

		try {
			await hello(m);
		} catch (error) {
			console.error(error)
		} finally {
			client.read(m.key);
		}
	})

	apiRoutes(server())
		.listen({ port: 3000, }, (err, address) => {
			if (err) {
				console.error(err)
				process.exit(1)
			}
		});
}

start();
