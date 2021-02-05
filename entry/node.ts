// @ts-ignore
global.self = global.window = global;
const ws = require('ws')
global.WebSocket = ws;

import {useFetch} from "../impl/auth";
useFetch(require('cross-fetch'));

const fixedFetch = async (url, options) => {
    const result = await fetch(url, options);
    if (+result.status >= 300) {
        throw result;
    }
    return result;
};


export {ISession} from "../contracts";
export * from "../repository"


