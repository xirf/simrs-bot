import { Pool } from 'pg';
import pino from "../libs/logger"
import dotenv from "dotenv"

dotenv.config();

const host = process.env.DB_URL;
const port = process.env.DB_PORT;
const database = process.env.DB_NAME;
const user = process.env.DB_USER;
const password = process.env.DB_PASS;

if (!host || !port || !database || !user || !password) {
    pino.fatal('One or more required environment variables are not set.');
    process.exit(1);
}

const DB = new Pool({
    host: host as string,
    port: parseInt(port),
    database: database as string,
    user: user as string,
    password: password as string,
});

DB.connect()
    .then(() => {
        pino.info('Connected to the database successfully');
    })
    .catch((error) => {
        pino.fatal(error);
        process.exit(1);
    });

export default DB