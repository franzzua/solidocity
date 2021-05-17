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
    }, 10000);


    it('profile should have user', async () => {
        expect(profile.Me.FullName).not.toBe(null);
    }, 20000);


    it('profile could have trusted apps', async () => {
        console.log(profile.Me.TrustedApps.Items.map(x => x.Origin));
    }, 20000);


    it('add localhost to trusted apps', async () => {
        return ;
        console.log(profile.Me.TrustedApps.Items.map(x => x.Origin));
        const newApp = await profile.Me.TrustedApps.Add();
        newApp.Origin = 'http://localhost:3200';
        newApp.Modes = [acl.Read, acl.Write, acl.Control];
        newApp.Save();
        await profile.Save();
        await profile.Init();
        const existed = profile.Me.TrustedApps.Items.filter(x => x.Origin == newApp.Origin)
        expect(existed.length).toBeGreaterThan(0);
        for (let trustedApp of existed) {
            trustedApp.Remove();
        }
        await profile.Save();

    }, 20000);
});
