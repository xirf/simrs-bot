import log from "./utils/logger";


log.info("Loading environment variables...");
require("dotenv").config({
    override: !1,
});
log.info("Running in " + process.env.NODE_ENV || "Development" + " mode");


import db from "./db/client";
import startSock from "./lib/waclient";

(async () => {
    log.info("Connecting to database...");
    await db.connect();

    log.info("Starting sock...");
    await startSock();
})()

