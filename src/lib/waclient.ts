import { Boom } from '@hapi/boom'
import NodeCache from 'node-cache'
import pino from '../utils/logger'
import handler from '../commands/handler'
import { Reply } from '../types/Client'
import auth from '../lib/session'
import db from '../db/client'
import qrCode from "qrcode-terminal"
import log from '../utils/logger'

import makeWASocket, {
    delay,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    isJidUser, proto,
    WAMessageContent,
    WAMessageKey
} from '@whiskeysockets/baileys'

const logger = pino.child({});
logger.level = 'debug'

const doReplies = !process.argv.includes('--no-reply')

// external map to store retry counts of messages when decryption/encryption fails
// keep this out of the socket itself, so as to prevent a message decryption/encryption loop across socket restarts
const msgRetryCounterCache = new NodeCache()

// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = makeInMemoryStore({ logger })
store?.readFromFile('./store/waStore.json')
// save every 10s
setInterval(() => {
    store?.writeToFile('./store/waStore.json')
}, 10_000)


// start a connection
const startSock = async () => {
    const { state, saveState } = await auth(db)
    // fetch latest version of WA Web
    const { version, isLatest } = await fetchLatestBaileysVersion()
    log.info(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        msgRetryCounterCache,
        generateHighQualityLinkPreview: true,
        // ignore all non user (group, broadcast) messages
        shouldIgnoreJid: jid => !isJidUser(jid),

        // implement to handle retries & poll updates
        getMessage,
    })
    store?.bind(sock.ev)


    // prevent immediate send without read message that may cause banned
    const sendMessageWTyping: Reply = async (msg, jid) => {
        await sock.presenceSubscribe(jid)
        await delay(500)

        await sock.sendPresenceUpdate('composing', jid)
        await delay(1000)

        await sock.sendPresenceUpdate('paused', jid)
        await sock.sendMessage(jid, msg)
    }


    sock.ev.process(
        async (events) => {
            if (events[ 'connection.update' ]) {
                const update = events[ 'connection.update' ]

                if (update.qr) {
                    log.info('New QR received, please scan to continue')
                    qrCode.generate(update.qr, { small: true })
                }

                const { connection, lastDisconnect } = update
                if (connection === 'close') {
                    // reconnect if not logged out
                    if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                        setTimeout(() => {
                            startSock()
                        }, 3000);
                    } else {
                        log.fatal('Connection closed. You are logged out.')
                        process.exit(1)
                    }
                }

                log.info('connection update', update)
            }

            if (events[ 'creds.update' ]) {
                await saveState()
            }

            if (events.call) {
                log.info('recv call event', events.call)
            }

            if (events[ 'messages.upsert' ]) {
                const upsert = events[ 'messages.upsert' ]
                log.info('recv messages ', JSON.stringify(upsert, undefined, 2))

                if (upsert.type === 'notify') {
                    for (const msg of upsert.messages) {
                        if (!msg.key.fromMe && doReplies) {
                            // reply to messages
                            await handler(msg, sendMessageWTyping)
                        }
                    }
                }
            }

        }
    )

    
    // this function use to get message from store
    async function getMessage(key: WAMessageKey): Promise<WAMessageContent | undefined> {
        if (store) {
            const msg = await store.loadMessage(key.remoteJid!, key.id!)
            return msg?.message || undefined
        }
        
        return proto.Message.fromObject({})
    }

    
    // set global sock to use in other file
    globalThis.sock = sock

    // in case of import this file, return sock
    return sock
}

export default startSock