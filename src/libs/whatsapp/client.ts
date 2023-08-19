const EventEmitter = require('events');
import makeWASocket, { DisconnectReason, useMultiFileAuthState, MessageType, JidWithDevice } from "@whiskeysockets/baileys";
import { pino } from "pino";
import { Boom } from "@hapi/boom";
import fs from 'fs';

class Connection extends EventEmitter {
    constructor() {
        super();
        this.state = null;
        this.socket = null;
        this.i = 0;
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

            fs.writeFileSync(`./dump/message_${this.i}.json`, JSON.stringify(messages, null, 2));
            this.i++;

            const message = messages.messages[ 0 ];

            if (!message || message.key.fromMe || message.key && message.key.remoteJid == 'status@broadcast') return;
            // if (messages.message.ephemeralMessage) messages.message = messages.message.ephemeralMessage.message;

            this.emit('messagesUpsert', message);
        });
    }

    public async sendMessage(jid, text: string) {
        await this.socket.sendMessage(jid, { text });
    }

    public async sendList(jid: string, text: string, section: object) {
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

    public async read(keys) {
        await this.socket.readMessages([ keys ]);
    }


}


export default new Connection();