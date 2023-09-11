import log from "./utils/logger";

// Just to make sure that the environment variables are loaded
log.info("Loading environment variables...");
require("dotenv").config({
    override: !1,
});
log.info("Running in " + process.env.NODE_ENV || "Development" + " mode");


// Then we can start everything
// the db isnt encapsulated in a function because it needs to be imported 
// in other files without the need to call a function first
import db from "./db/client";


import startSock from "./lib/waclient";
import handler from "./commands/handler";



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
