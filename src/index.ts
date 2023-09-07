import db from "./db";
import startSock from "./lib/waclient";
import dotenv from "dotenv";

dotenv.config();

await db.connect();
startSock();
