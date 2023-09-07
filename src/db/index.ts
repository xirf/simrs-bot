import { Client } from 'pg';
import log from '@/utils/logger';

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;


if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_DATABASE) {
    log.fatal('Missing database environment variables');
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
        await db.connect();
        log.info('Connected to database');
    } catch (error) {
        log.fatal('Failed to connect to database');
        process.exit(1);
    }
})();

export default db;