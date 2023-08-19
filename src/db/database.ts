import { Client, QueryResult } from 'pg';
import fs from "fs"

export const DB = new Client({
    host: 'localhost',
    port: 5432,
    database: 'simrs',
    user: 'postgres',
    password: 'rangga123',
});

type DatabaseResult = QueryResult<any>;

export const parseResult = (result: DatabaseResult) => {
    return result.rows
};
