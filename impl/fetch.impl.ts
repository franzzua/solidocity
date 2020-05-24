import * as auth from 'solid-auth-cli'

const realFetch = auth.fetch;

export const FetchImpl = async (url, options) => {
    const result = await realFetch(url, options);
    if (+result.status >= 300){
        throw result;
    }
    return result;
};

auth.fetch = FetchImpl;

export default auth;
