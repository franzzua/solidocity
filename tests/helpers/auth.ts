jest.mock('form-urlencoded', () => {
    const real = jest.requireActual('form-urlencoded');
    real.default = real;
    return real;
})
import * as auth from 'solid-auth-cli';
import {useFetch} from "../../impl/auth";
import {ISession} from "../../contracts";
import { SolidNodeClient } from "solid-node-client";
import {resolve} from "path";
import * as fs from "fs/promises";
import {Session} from "@inrupt/solid-client-authn-node";
//const path = resolve(__dirname, '../../dist/test-pod');
// export const POD = 'http://localhost:3000';//`file://${path}`;
export const POD = 'https://pod.inrupt.com/fransua';//`file://${path}`;

const home =  process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

const configPath = '~/.solid-ess-auth-config.json'.replace('~', home);
// const configPath = '~/.solid-auth-cli-config.json';

let _session: Promise<ISession> = _getSession();
export function getSession(): Promise<ISession>{
    return _session;
}

async function _getSession(): Promise<ISession> {
    console.log('get session');
    const client = new SolidNodeClient({
        handlers : { https : 'solid-client-authn-node' },
    });
    const configFile = await fs.readFile(configPath,'utf8');

    const config = JSON.parse(configFile);
    config.debug = true;
    try {
        const session = new Session(
            {
                onNewRefreshToken: (newToken: string) => {
                    console.log('new refresh  token', newToken);
                    config.refreshToken = newToken;
                    fs.writeFile(configPath, JSON.stringify(config), 'utf8')
                },
            },
            "my-session"
        );
        const result = await session.login(config)
        // const result = await client.login(config);
        if (!session.info.isLoggedIn)
            throw new Error('not authenticated');
        // client.createServerlessPod(POD);
        // const session = (await auth.currentSession() ?? await auth.login())
        useFetch(async function (url, options) {
            // console.info(`${options.method ?? 'GET'}: ${url}`);
            const res = await session.fetch(url, options);
            // console.info(`${options.method ?? 'GET'}: ${url}`, res.status);
// res.headers.set('Link', `<rel=${url}.acl>`);
            // res.headers.set('Location', `${url}`);
            return res;
        });
        // await useSession({
        //     ...session,
        //     idp: POD
        // });
        return {
            webId: session.info.webId,
            issuer: config.oidcIssuer
        };
    }catch (e) {
        throw e ?? new Error('not authenticated');
    }
}

//
// const URL = global.URL;
// class URLExt extends URL {
//     constructor(url: string) {
//         super(url);
//     }
//     get origin(){
//         if (this.href.startsWith('file://')){
//             return  'file://';
//         }
//         return super.origin;
//     }
// }
// global.URL = URLExt;
