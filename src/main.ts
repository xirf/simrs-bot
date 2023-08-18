import server, { apiRoutes } from "./libs/server";
import client from "./libs/whatsapp/client";

const start = async () => {
	await client.connect();
	await server().ready()

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