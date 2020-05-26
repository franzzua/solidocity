import {Profile} from "./repository";
import {useAuth} from "./impl/fetch";
import { ISession } from "./contracts";
export * from "./repository"

export async function getMyName(auth) {
    const {currentSession, login} = useAuth(auth);
    const session = await currentSession() ?? await login();
    const profile = new Profile(session.webId);
    await profile.Init();
    return  profile.Me.FullName;
}
export {
    useAuth, ISession
}