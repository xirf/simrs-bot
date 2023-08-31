import DB from "./database";
import pino from "../libs/logger"
import { UserStateType } from "./../types/routes"
class UserState {
    private static instance: UserState;

    private constructor() { }

    static getInstance(): UserState {
        if (!UserState.instance) {
            UserState.instance = new UserState();
        }
        return UserState.instance;
    }

    async setData(key: string, value: UserStateType) {
        try {
            await DB.query(`
                INSERT INTO public.chat_state (id, state)
                VALUES ($1, $2)
                ON CONFLICT (id)
                DO UPDATE SET state = $2;
            `, [ key, value ]);
        } catch (error) {
            pino.error(error, `Failed to insert state to DB for ${key}`)
        }
    }

    async getData(key: string, retryCount = 0): Promise<UserStateType> {
        try {
            const result = await DB.query("SELECT state FROM public.chat_state WHERE id = $1", [ key ]);
            return JSON.parse(result.rows[ 0 ].state);
        } catch (error) {

            if (retryCount < 3) {
                pino.warn(error, `Failed to get state from DB for ${key}, retrying... (${retryCount + 1})`)
                return await this.getData(key, retryCount + 1);
            } else {
                pino.warn(error, `Can't find state from ${key}, set the state  to empty`)
                return {
                    isCollecting: false,
                    routes: [],
                    collection: {}
                }
            }
        }
    }
}

export default UserState.getInstance();