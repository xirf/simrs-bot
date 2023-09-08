import { Client } from 'pg';
import log from '../utils/logger';

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;
const TABLE_SESSION = process.env.TBL_SESSIONS;
const TABLE_STATE = process.env.TBL_STATE;
const TABLE_TEMPLATE = process.env.TBL_TEMPLATE;

if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_DATABASE) {
    log.fatal('Missing database environment variables');
    process.exit(1);
}

if (!TABLE_SESSION || !TABLE_STATE || !TABLE_TEMPLATE) {
    log.error('Whatsapp table name is not defined, please set the environment variables');
    process.exit(1);
}

const db = new Client({
    host: DB_HOST,
    port: parseInt(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,

});

// test connection to database
(async () => {
    try {
        // check if table session exists
        const checkSession = `SELECT * FROM information_schema.tables WHERE table_name = '${TABLE_SESSION}'`;
        if (!(await db.query(checkSession)).rows.length) {
            log.warn(`Table ${TABLE_SESSION} does not exist. Creating...`);

            // create table if it doesn't exist
            const query = `CREATE TABLE IF NOT EXISTS ${TABLE_SESSION} (
                id SERIAL PRIMARY KEY,
                sessionId VARCHAR(255) NOT NULL,
                session TEXT
            )`;
            await db.query(query);
        }

        // check if table state exists
        const checkState = `SELECT * FROM information_schema.tables WHERE table_name = '${TABLE_STATE}'`;
        if (!(await db.query(checkState)).rows.length) {
            log.warn(`Table ${TABLE_STATE} does not exist. Creating...`);

            // create table if it doesn't exist
            const query = `CREATE TABLE IF NOT EXISTS ${TABLE_STATE} (
                id SERIAL PRIMARY KEY,
                key VARCHAR(255) NOT NULL,
                value TEXT
            )`;
            await db.query(query);
        }

        // check if table template exists
        const checkTemplate = `SELECT * FROM information_schema.tables WHERE table_name = '${TABLE_TEMPLATE}'`;
        if (!(await db.query(checkTemplate)).rows.length) {
            log.warn(`Table ${TABLE_TEMPLATE} does not exist. Creating...`);

            const query = `CREATE TABLE IF NOT EXISTS ${TABLE_TEMPLATE} (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                template TEXT NOT NULL
            )`;
            await db.query(query);
        }


    } catch (error) {
        log.fatal('Failed to connect to database');
        process.exit(1);
    }
})();

export default db;