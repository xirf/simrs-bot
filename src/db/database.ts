import { Client } from 'pg';
import pino from "../libs/logger"
import dotenv from "dotenv"

dotenv.config();

const DB = new Client({
    host: process.env.DB_URL,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
}).connect()
    .then(() => {
        pino.info('Database connection established')
    })
    .catch((error) => {
        pino.info("Failed to set up database connection")
        pino.fatal(error);
        process.exit(1);
    })

export default DB