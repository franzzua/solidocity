import * as auth from 'solid-auth-cli';
import {useAuth} from "../impl/fetch";

const {
    login,
    logout,
    getCredentials,
    fetch,
    popupLogin,
    currentSession
} = useAuth(auth);

export {
    login,
    logout,
    getCredentials,
    fetch,
    popupLogin,
    currentSession
}

export const POD = 'https://fransua.inrupt.net';