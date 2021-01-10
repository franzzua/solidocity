import {getSession} from "./store";
import {PoPToken} from "./poPToken";

export const authFetch = (async (url, request: RequestInit) => {
    // console.info('request', url, request.method);
    const session = await getSession();
    if (session) {
        request = request || {};
        request.method = request.method || 'GET';
        request.headers = request.headers || {};
        const token = await PoPToken.issueFor(url, session);
//         saveIdentityManager(identityManager, settingsFile)
        request.credentials = "include";
        request.headers['authorization'] = `Bearer ${token}`;
    }
    const result = await authFetch.real(url, request);
    // console.log(result);
    return result;
}) as Window["fetch"] & {real: Window["fetch"]};

export function useFetch(fetch){
    authFetch.real = fetch;
}


export const fetch = authFetch;