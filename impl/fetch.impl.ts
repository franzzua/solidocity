import {ISession} from "../contracts";

let realFetch;

export const FetchImpl = async (url, options) => {
    const result = await realFetch(url, options);
    if (+result.status >= 300){
        throw result;
    }
    return result;
};

export function useAuth(auth):{
    fetch(req, options): Promise<any>;
    login(config?: {idp: string, username?: string, password?: string} | string): Promise<ISession>;
    popupLogin(): Promise<ISession>;
    currentSession(): Promise<ISession | null>;
    logout();
    getCredentials();
} {
    realFetch = auth.fetch;
    auth.fetch = FetchImpl;
    return auth;
}
export default {
    fetch: FetchImpl
}