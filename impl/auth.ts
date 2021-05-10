
export const authFetch = (async (url, request: RequestInit) => {
    return authFetch.real(url, request);
    // console.info('request', url, request.method);
    // const tokens = await getTokens();
    // if (tokens) {
    //     request = request || {};
    //     request.method = request.method || 'GET';
    //     request.headers = request.headers || {};
    //     saveIdentityManager(identityManager, settingsFile)
        // request.credentials = "include";
        // request.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    // }
    // const result = await authFetch.real(url, request);
    // console.log(result);
    // return result;
}) as Window["fetch"] & {real: Window["fetch"]};

export function useFetch(fetch){
    authFetch.real = fetch;
    // @ts-ignore
    // window.afetch = authFetch;
}


export const fetch = authFetch;
