import * as auth from 'solid-auth-cli';
import {Reference} from "./contracts";


export class AuthService{

    constructor(private config?: {idp: Reference, username?: string, password?: string} | string) {
    }

    public async GetSession(): Promise<ISession> {
        const session = await auth.currentSession();
        if (!session)
            return await this.Auth();
        return session;
    }

    public async Auth(): Promise<ISession> {
        try {
            return await auth.login(this.config);
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

