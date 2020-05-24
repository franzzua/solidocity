export abstract class AuthAppService {

    public abstract async GetSession(): Promise<ISession>;

    public abstract async Auth(): Promise<ISession>;
}

export interface ISession {
    issuer;
    webId;
    credentialType;
    authorization;
    sessionKey;
    idClaims;
    accessClaims;
}
