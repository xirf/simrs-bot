const EventEmitter = require('events');
import makeWASocket, { DisconnectReason, WAMessageKey, delay, isJidBroadcast, Browsers, isJidGroup, makeCacheableSignalKeyStore, AnyMessageContent } from "@whiskeysockets/baileys";
import pino from "../logger";
import { Boom } from "@hapi/boom";
import authClient from "./sessions"
import DB from "src/db/database";

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
        const { state, saveState, clearState } = await authClient(DB);

        this.socket = makeWASocket({
            printQRInTerminal: true,
            syncFullHistory: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino)
            },
            browser: Browsers.appropriate('Brave'),
            shouldIgnoreJid: jid => isJidBroadcast(jid) || isJidGroup(jid),
            logger: pino
        });

        this.socket.ev.on("creds.update", saveState);

        this.socket.ev.on("connection.update", (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "close") {
                const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

                console.warn("Connection closed");

                if (shouldReconnect) {
                    console.info("Reconnecting...");
                    setTimeout(() => this.connect(), 5000);
                } else {
                    pino.error(lastDisconnect.error)
                    process.exit(0);
                }

            } else if (connection === "open") {
                this.emit('connectionOpen');
            }
        });

        this.socket.ev.on("messages.upsert", async (messages) => {
            const message = messages.messages[ 0 ];
            if (!message || message.key.fromMe || message.key && message.key.remoteJid == 'status@broadcast') return;

            await this.socket.readMessages(message.key);
            await this.socket.sendPresenceUpdate('available', message.key.id)
            this.emit('messagesUpsert', message);
        });
    } s

    public async reply(key: WAMessageKey, msg: AnyMessageContent) {

        const jid = key.remoteJid as string
        await this.readMessages?.([ key ])
        await this.socket.presenceSubscribe?.(jid)
        await delay(500)

        await this.socket.sendPresenceUpdate?.('composing', jid)
        await delay(2000)
        await this.socket.sendPresenceUpdate?.('paused', jid)
        await this.socket.sendMessage(jid, msg)
    }

    public async sendMessage(jid: string, msg: AnyMessageContent) {
        await this.socket.sendMessage(jid, msg)
    }

    public async onWhatsapp(jid) {
        return await this.socket.onWhatsApp(jid)
    }


}


export default new Connection();