import { DB } from "./db/database";
import { hello } from "./libs/commands";
import server, { apiRoutes } from "./libs/server";
import client from "./libs/whatsapp/client";
import { writeFileSync } from 'fs'

const start = async () => {
	await client.connect();
	await server().ready()
	await DB.connect()
		.then(() => {
			console.log('Connected to the database successfully');
		})
		.catch((error) => {
			console.error('Error connecting to the database:', error);
			process.exit(1);
		})

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
