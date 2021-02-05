import {ISession} from "../contracts";
// import {getBearerToken} from "@inrupt/oidc-client-ext";

export const store = (() => {
    let store = {};
    return {
        async getItem(key) {
            return store[key] ?? localStorage.getItem(key);
        },
        async setItem(key, value) {
            if (typeof value == "object")
                store[key] = JSON.stringify(value);
            else
                store[key] = value;
            localStorage.setItem(key, store[key]);
        }
    }
})();
//
// export async function getSession(): Promise<ISession> {
//     const value = await store.getItem('solid-auth-client');
//     return value && JSON.parse(value) as ISession;
// }
// export async function useSession(session: ISession) {
//     await store.setItem('solid-auth-client', session);
// }

// export async function getTokens(): Promise<any>{
//     const tokens = await store.getItem('solid-auth-tokens');
//     return tokens && JSON.parse(tokens);
// }
//
// export async function handleTokenFromUrl(url: string){
//     try {
//         const tokens = await getBearerToken(url);
//         await store.setItem('solid-auth-tokens', tokens);
//         return tokens;
//     }catch (e) {
//         return await getTokens();
//     }
// }
