import makeWASocket, { Browsers, DisconnectReason, BufferJSON, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { pino } from "pino";
import { Boom } from "@hapi/boom";
import logger from "./libs/logger";

async function connect() {
	const { state, saveCreds } = await useMultiFileAuthState("sessions");

	const socket = makeWASocket({
		printQRInTerminal: true,
		syncFullHistory: false,
		auth: state,
		logger: pino({
			level: "",
			transport: {
				target: "pino-pretty",
			},
		}),
	});

	socket.ev.on("creds.update", saveCreds);

	socket.ev.on("connection.update", (update) => {
		const { connection, lastDisconnect } = update;
		if (connection === "close") {
			const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut

			logger.info({ shouldReconnect }, "Connection Closed");

			if (shouldReconnect) {
				logger.info("Reconnecting...");
				connect();
			}
		} else if (connection === "open") {
		}
	});

	socket.ev.on("messages.upsert", async (messages) => {
		// console.log(JSON.stringify(messages, undefined, 2));
		// pino().info({ messages: messages.messages }, "messages.upsert");
		logger.info({ messages: messages.messages }, "messages.upsert");

		// console.log("replying to", messages.messages[0].key.remoteJid);
		// await sock.sendMessage(messages.messages[0].key.remoteJid, { text: "Hello there!" });
	});
}

connect();
