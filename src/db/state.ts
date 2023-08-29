import DB from "./database";
class UserState {
    private static instance: UserState;
    private data: Record<string, any> = {};

    private constructor() { }

    static getInstance(): UserState {
        if (!UserState.instance) {
            UserState.instance = new UserState();
        }
        return UserState.instance;
    }

    async setData(key: string, value: any) {
        this.data[ key ] = value;
        try {
            await DB.query(`
                INSERT INTO public.chat_state (id, state)
                VALUES ($1, $2)
                ON CONFLICT (id)
                DO UPDATE SET state = $2;
            `, [ key, value ]);
        } catch (error) {
            console.error('Error in setData:', error);
        }
    }

    async getData(key: string) {
        try {
            const result = await DB.query("SELECT state FROM public.chat_state WHERE id = $1", [ key ]);
            if (result.rows.length > 0) {
                return JSON.parse(result.rows[ 0 ].state);
            } else {
                return this.data[ key ]
            }
        } catch (error) {
            return this.data[ key ]
        }
    }
}

export default UserState.getInstance();