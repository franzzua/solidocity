import {Profile} from "./repository";
import {useAuth} from "./impl/fetch.impl";
export * from "./repository"

export async function getMyName(auth) {
    const {getSession, login} = useAuth(auth);
    const session = await getSession() ?? await login();
    const profile = new Profile(session.webId);
    await profile.Init();
    return  profile.Me.FullName;
}
