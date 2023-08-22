import { Client, QueryResult } from 'pg';
import pino from "../libs/logger"

const DB = new Client({
    host: 'localhost',
    port: 5432,
    database: 'simrs',
    user: 'postgres',
    password: 'rangga123',
});

DB.connect()
    .then(() => {
        pino.info('Connected to the database successfully');
    })
    .catch((error) => {
        pino.fatal('Error connecting to the database:', error);
        process.exit(1);
    })

export default DB