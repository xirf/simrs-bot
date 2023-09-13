require("dotenv").config();
import log from "./utils/logger";
import db from "./db/client";
import startSock from "./lib/whatsapp/waclient";
import handler from "./commands/handler";

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
        await handler(msg, sendMessageWTyping)
    })

    // make sock global
    globalThis.sock = sock;
})()
