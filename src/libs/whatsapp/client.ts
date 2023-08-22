const EventEmitter = require('events');
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";
import pino from "../logger";
import { Boom } from "@hapi/boom";


interface MediaMessageJSON {
    url: URL
}

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
            logger: pino
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
            const message = messages.messages[ 0 ];

            // Block messages from self and status
            if (!message || message.key.fromMe || message.key && message.key.remoteJid == 'status@broadcast') return;

            // block messages from group
            if (message.key.remoteJid.endsWith('@g.us') || message.key.participant) return;


            // emmit message to listener
            this.emit('messagesUpsert', message);
        });
    }

    public async sendMessage(jid, text: string) {
        await this.socket.sendMessage(jid, { text });
    }

    public async sendImage(jid: string, path: Buffer | MediaMessageJSON, caption: string) {
        await this.socket.sendMessage(jid, {
            image: path,
            caption
        });
    }

    public async updateMediaMessage() {
        await this.socket.updateMediaMessage()
    }

    public async read(keys) {
        await this.socket.readMessages([ keys ]);
    }

    public async onWhatsapp(jid) {
        return await this.socket.onWhatsApp(jid)
    }


}


export default new Connection();