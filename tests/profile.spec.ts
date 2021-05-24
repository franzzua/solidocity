import "jest";
import  "../entry/node";
import {Profile} from "../repository";
import { acl } from "rdf-namespaces";
import {getSession} from "./helpers/auth";
import {ISession} from "../contracts";

let session: ISession;
let profile: Profile;


describe('solid profile', () => {

    beforeAll(async () => {
        session = await getSession();
        profile = new Profile(session.webId);
        await profile.Init();
    }, 30000);


    it('profile should have user', async () => {
        expect(profile.Me.FullName).not.toBe(null);
    }, 20000);

    it('add localhost to trusted apps', async () => {
        const newApp = await profile.Me.TrustedApps.Add();
        newApp.Origin = 'http://localhost:3200';
        newApp.Modes = [acl.Read, acl.Write];
        newApp.Save();
        profile.Me.Save();
        await profile.Save();
        await profile.Init();
        const existed = profile.Me.TrustedApps.Items.filter(x => x.Origin == newApp.Origin)
        expect(existed.length).toBeGreaterThan(0);

    }, 20000);


    it('remove localhost to trusted apps', async () => {
        const existed = profile.Me.TrustedApps.Items.filter(x => x.Origin == 'http://localhost:3200');
        for (let trustedApp of existed) {
            profile.Me.TrustedApps.Remove(trustedApp);
            trustedApp.Remove();
        }
        profile.Me.Save();
        await profile.Save();
        await profile.Init();
        const existed2 = profile.Me.TrustedApps.Items.filter(x => x.Origin == 'http://localhost:3200');
        expect(existed2.length).toBe(0);

    }, 30000);
});
