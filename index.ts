import {authService} from "./auth-service";
import {Profile} from "./repository";
import auth from "./impl/fetch.impl";
export * from "./repository"
export * from "./auth-service";

export async function getMyName() {
    const session = await authService.GetSession();
    const profile = new Profile(session.webId);
    await profile.Init();
    return  profile.Me.FullName;
}
export {
    auth
}