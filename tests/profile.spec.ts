import "jest";
import {authService, ISession} from "../auth-service";
import {Profile} from "../repository";

let session: ISession;
let profile: Profile;


describe('solid repository', () => {

    beforeAll(async () => {
        session = await authService.GetSession();
        profile = new Profile(session.webId);
        await profile.Init();
    }, 10000);


    it('profile should have user', async () => {
        expect(profile.Me.FullName).not.toBe(null);
    }, 20000);

});
