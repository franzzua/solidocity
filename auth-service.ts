import * as auth from 'solid-auth-cli';
import {readFileSync} from "fs";
import {join} from 'path';
const homedir = require('os').homedir();

export class AuthService{

    public async GetSession(): Promise<ISession> {
        const session = await auth.currentSession();
        if (!session)
            return await this.Auth();
        return session;
    }

    public async Auth(): Promise<ISession> {
        try {
            const authCfg = readFileSync(join(homedir,'solid-auth-cfg.json'), 'utf8');
            const session = await auth.login(JSON.parse(authCfg));
            return session;
        } catch (e) {
            throw e;
        }
    }
}
export const authService = new AuthService();


export interface ISession {
    issuer;
    webId;
    credentialType;
    authorization;
    sessionKey;
    idClaims;
    accessClaims;
}

