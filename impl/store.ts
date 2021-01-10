import {ISession} from "../contracts";

export const store = (() => {
    let store = {};
    return {
        async getItem(key) {
            return store[key];
        },
        async setItem(key, value) {
            if (typeof value == "object")
                store[key] = JSON.stringify({session: value});
            else
                store[key] = value;
        }
    }
})();

export async function getSession(): Promise<ISession> {
    const value = await store.getItem('solid-auth-client');
    return value && JSON.parse(value).session as ISession;
}
export async function useSession(session: ISession) {
    await store.setItem('solid-auth-client', session);
}