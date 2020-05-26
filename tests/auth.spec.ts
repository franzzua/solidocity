import "jest";
import {currentSession,  login} from "./auth";
import {ISession} from "../contracts";


it('should login', async () => {
    const session = await currentSession() ?? await login();
    expect(session.webId).not.toBe(null);
});

it('should has session', async () => {
    const session = await currentSession() ;
    expect(session.webId).not.toBe(null);
});
