import { hello } from "./libs/commands";
import server, { apiRoutes } from "./libs/server";
import client from "./libs/whatsapp/client";
import { writeFileSync } from 'fs'
const start = async () => {
	await client.connect();
	await server().ready()

	client.on('messagesUpsert', async (m) => {
		let fromMe = m[ 0 ].key.fromMe
		if (!fromMe) {
			await hello(m[ 0 ]);
		}
	})

	apiRoutes(server())
		.listen({ port: 3000, }, (err, address) => {
			if (err) {
				console.error(err)
				process.exit(1)
			}

			console.log("Server Started on ", address);
		});
}

start();