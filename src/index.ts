require("dotenv").config();
import log from "./utils/logger";
import db from "./db/client";
import startSock from "./lib/whatsapp/waclient";
import handler from "./commands/handler";
import extractMessage from "./utils/extract";

// Just to make sure that the environment variables are loaded
log.info("Loading environment variables...");
log.info("Running in " + process.env.NODE_ENV || "Development" + " mode");


(async () => {
    log.info("Connecting to database...");
    await db.connect();

    log.info("Starting sock...");

    const { sock, sendMessageWTyping } = await startSock();

    sock.ev.on("messages.upsert", async (m) => {
        let msg = m.messages[ 0 ]
        console.log(JSON.stringify(msg, null, 2))

        if (msg.key.fromMe) return;

        // get the text from the message
        let { text } = await extractMessage(msg);

        // You can simply catch the message like this
        let thanks = [ "terima kasih", "makasih", "thanks", "thank you", "terimakasih", "terima kasih banyak", "ty", "thx", "tq", "tks", "makasi", "makasih banyak", "makasih ya", ]

        if (thanks.includes(text.toLowerCase())) {
            let template = await db.query(`SELECT template FROM "public".${process.env.TABLE_TEMPLATE} WHERE name='thanks'`)
            sendMessageWTyping({
                text: template.rows[ 0 ].template ?? "Sama-sama 😇"
            }, msg.key.remoteJid)
            return;
        }


        // or handling it with handler
        // this will make the code more readable yet you can decide 
        // how conversation will be flow 
        await handler(msg, sendMessageWTyping)
    })

    // make sock global
    globalThis.sock = sock;
})()
