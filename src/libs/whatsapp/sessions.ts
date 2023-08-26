import { Pool } from 'pg';
import { BufferJSON, initAuthCreds, proto } from '@whiskeysockets/baileys';
import type { AuthenticationCreds, AuthenticationState, SignalDataTypeMap } from '@whiskeysockets/baileys';


declare type ClientAuth = {
    state: AuthenticationState
    saveState: () => Promise<void>
    clearState: () => Promise<void>
}


export default async (pool: Pool): Promise<ClientAuth> => {
    const KEY_MAP: { [ T in keyof SignalDataTypeMap ]: string } = {
        'pre-key': 'preKeys',
        session: 'sessions',
        'sender-key': 'senderKeys',
        'app-state-sync-key': 'appStateSyncKeys',
        'app-state-sync-version': 'appStateVersions',
        'sender-key-memory': 'senderKeyMemory',
    };

    let creds: AuthenticationCreds;
    let keys: unknown = {};

    const query = 'SELECT session FROM sessions WHERE sessionId = $1';
    const queryParams = [ 'creds' ];
    const storedCreds = await pool.query(query, queryParams);

    if (storedCreds.rows.length > 0 && storedCreds.rows[ 0 ].session) {
        const parsedCreds = JSON.parse(storedCreds.rows[ 0 ].session, BufferJSON.reviver);
        creds = parsedCreds.creds as AuthenticationCreds;
        keys = parsedCreds.keys;
    } else {
        const insertQuery = 'INSERT INTO sessions (sessionId, session) VALUES ($1, $2)';
        const insertParams = [ 'creds', JSON.stringify({ creds: initAuthCreds(), keys }, BufferJSON.replacer) ];

        try {
            await pool.query(insertQuery, insertParams);
        } catch (error) {
            console.error('Error inserting session');
            console.error(error)
        }

        creds = initAuthCreds();
    }

    const saveState = async (): Promise<void> => {
        const updateQuery = 'UPDATE sessions SET session = $1 WHERE sessionId = $2';
        const updateParams = [ JSON.stringify({ creds, keys }, BufferJSON.replacer), 'creds' ];

        try {
            await pool.query(updateQuery, updateParams);
        } catch (error) {
            console.error('Error updating session:', error);
            console.error(error)
        }
    };

    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => {
                    const key = KEY_MAP[ type ];
                    return ids.reduce((dict: any, id) => {
                        const value: unknown = keys[ key ]?.[ id ];
                        if (value) {
                            if (type === 'app-state-sync-key') dict[ id ] = proto.Message.AppStateSyncKeyData.fromObject(value);
                            dict[ id ] = value;
                        }
                        return dict;
                    }, {});
                },
                set: async (data) => {
                    for (const _key in data) {
                        const key = KEY_MAP[ _key as keyof SignalDataTypeMap ];
                        keys[ key ] = keys[ key ] || {};
                        Object.assign(keys[ key ], data[ _key ]);
                    }
                    try {
                        await saveState();
                    } catch (error) {
                        console.error('Error saving state:', error);
                        console.error(error)
                    }
                },
            },
        },
        saveState,
        clearState: async (): Promise<void> => {
            const deleteQuery = 'DELETE FROM sessions WHERE sessionId = $1';
            const deleteParams = [ 'creds' ];

            try {
                await pool.query(deleteQuery, deleteParams);
            } catch (error) {
                console.error('Error deleting session:', error);
                console.error(error)
            }
        },
    };
};
