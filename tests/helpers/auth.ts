import * as nodeFetch from "node-fetch";
import {useFetch, useSession} from "../../impl/auth";

const fetch = require("fetch");
useFetch(fetch);

import * as auth from 'solid-auth-cli';

export async function getSession() {
    const session = (await auth.currentSession() ?? await auth.login())
    await useSession({
        ...session,
        idp: POD
    });
    return {
        ...session,
        pod: POD
    };
}

export const POD = 'https://fransua.solid.community';