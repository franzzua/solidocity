import {ISession} from "../contracts";
import * as auth from "solid-auth-client-real/lib/authn-fetch.js";
import { fs } from "./file.service";
const  Fetch = require("node-fetch");

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

export function useFetch( fetch: typeof window.fetch) {
    Object.assign(Fetch, fetch);
    Fetch.fetch = (req, options) => {
        return auth.authnFetch(store, fetch, req, options);
    };
    fs.fetch = Fetch.fetch
}

export async function useSession(session: ISession) {
    await store.setItem('solid-auth-client', session);
}