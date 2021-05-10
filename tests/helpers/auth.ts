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

//const path = resolve(__dirname, '../../dist/test-pod');
// export const POD = 'http://localhost:3000';//`file://${path}`;
export const POD = 'https://fransua.solidcommunity.net';//`file://${path}`;

const home =  process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

export async function getSession(): Promise<ISession> {
    const client = new SolidNodeClient();
    const configFile = await fs.readFile(`${home}/.solid-auth-cli-config.json`,'utf8');
    const config = JSON.parse(configFile);
    const result = await client.login(config);
    // client.createServerlessPod(POD);
    // const session = (await auth.currentSession() ?? await auth.login())
    useFetch(async function (url,options) {
        // console.info(`${options.method ?? 'GET'}: ${url}`);
        const res = await result.fetch(url, options);
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
        ...result.info,
        // ...session,
        // issuer:  'http://localhost:3000',
        // webId:  'http://localhost:3000/profile/card#me',
        // pod: POD
    };
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
