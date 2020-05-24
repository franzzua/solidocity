import "jest";
import {AppContainer} from "../../container";
import {AuthAppService, ISession} from "@app";
import {Profile} from "../repository";
import {POD} from "../container";

const pod = 'https://fransua.inrupt.net';

AppContainer.provide([
    {provide: POD, useValue: pod},
]);
const authService = AppContainer.get<AuthAppService>(AuthAppService);
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
