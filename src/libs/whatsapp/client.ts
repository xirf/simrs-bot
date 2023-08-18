const EventEmitter = require('events');
import makeWASocket, { DisconnectReason, useMultiFileAuthState, MessageType, JidWithDevice } from "@whiskeysockets/baileys";
import { pino } from "pino";
import { Boom } from "@hapi/boom";

class Connection extends EventEmitter {
    constructor() {
        super();
        this.state = null;
        this.socket = null;
    }

    async connect() {
        const { state, saveCreds } = await useMultiFileAuthState("sessions");

        this.socket = makeWASocket({
            printQRInTerminal: true,
            syncFullHistory: false,
            auth: state,
            logger: pino({
                level: "debug",
                transport: {
                    target: "pino-pretty",
                },
            }),
        });

        this.socket.ev.on("creds.update", saveCreds);

        this.socket.ev.on("connection.update", (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "close") {
                const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

                console.info({ shouldReconnect }, "Connection Closed");

                if (shouldReconnect) {
                    console.info("Reconnecting...");
                    this.connect();
                }
            } else if (connection === "open") {
                this.emit('connectionOpen');
            }
        });

        this.socket.ev.on("messages.upsert", async (messages) => {
            this.emit('messagesUpsert', messages.messages);
        });
    }

    public async sendMessage(jid, text: string) {
        await this.socket.sendMessage(jid, { text });
    }

    public async sendImage(jid: string, path: string, caption: string) {
        await this.socket.sendMessage(jid, {
            image: {
                url: path,
            },
            caption
        });
    }

    public async updateMediaMessage() {
        await this.socket.updateMediaMessage()
    }
}


export default new Connection();