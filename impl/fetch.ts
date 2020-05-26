import {ISession} from "../contracts";

let realFetch;

export const Fetch = async (url, options) => {
    const result = await realFetch(url, options);
    if (+result.status >= 300){
        throw result;
    }
    return result;
};

export function useAuth(auth):{
    fetch(req, options): Promise<any>;
    login(config?: {idp: string, username?: string, password?: string} | string, registerConfig?: {
        clientName?, logoUri?, contacts?
    }): Promise<ISession>;
    popupLogin(): Promise<ISession>;
    currentSession(): Promise<ISession | null>;
    logout();
    getCredentials();
} {
    realFetch = auth.fetch;
    auth.fetch = Fetch;
    return auth;
}
export default {
    fetch: Fetch
}