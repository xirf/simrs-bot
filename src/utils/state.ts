import NodeCache from 'node-cache';
import { Client } from 'pg';
import db from '../db/client';
import log from './logger';
import config from '../config';

const stateTable = config.tables.state;

class GlobalState {
    private cache: NodeCache;

    constructor(private db: Client) {
        this.cache = new NodeCache();
    }

    async get(key: string): Promise<any> {
        const cachedData = this.cache.get(key);

        if (cachedData) {
            return cachedData;
        }

        try {
            let query = `SELECT value FROM ${stateTable} WHERE key = $1`;
            const result = await this.db.query(query, [ key ]);

            
            if (result.rows.length > 0) {
                log.info(`Restoring state for key ${key}`, result.rows[ 0 ]);
                
                const value = result.rows[ 0 ].value;
                this.cache.set(key, value, 3600); // Cache for 1 hour
                return value;
            }

            // Handle the case where the data doesn't exist in the database
            return null;
        } catch (error) {
            // Handle errors
            log.error(error);
            throw error;
        }
    }

    async update(key: string, value: any): Promise<void> {
        try {
            let query = `UPDATE ${stateTable} SET value = $2 WHERE key = $1`
            await this.db.query(
                query,
                [ key, JSON.stringify(value) ]
            );

            log.info(`Updating state for key ${key}`, value);

            this.cache.set(key, value, 3600); // Update the cache
        } catch (error) {
            // Handle errors
            log.error(error);
            throw error;
        }
    }

    async clear(key: string): Promise<void> {
        log.warn(`Clearing state for key ${key}`)
        try {
            let query = `DELETE FROM ${stateTable} WHERE key = $1`;
            await this.db.query(query, [ key ]);
            this.cache.del(key); // Delete from cache
        } catch (error) {
            // Handle errors
            log.error(error);
            throw error;
        }
    }

}

const state = new GlobalState(db);
export default state;