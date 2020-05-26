import * as auth from 'solid-auth-cli';
import {useAuth} from "../impl/fetch.impl";

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