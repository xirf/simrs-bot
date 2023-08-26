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

        setData(key: string, value: any) {
            this.data[ key ] = value;
        }

        getData(key: string) {
            return this.data[ key ];
        }
    }

    export default UserState.getInstance();