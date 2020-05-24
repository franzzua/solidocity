import * as auth from 'solid-auth-cli';
import {AuthAppService} from "./contracts";
import {readFileSync, readSync} from "fs";
import {join} from 'path';
const homedir = require('os').homedir();

export class NodeAuthAppService extends AuthAppService{

    public async GetSession() {
        const session = await auth.currentSession();
        if (!session)
            return await this.Auth();
        return session;
    }

    public async Auth() {
        try {
            const authCfg = readFileSync(join(homedir,'solid-auth-cfg.json'), 'utf8');
            const session = await auth.login(JSON.parse(authCfg));
            return session;
        } catch (e) {
            throw e;
        }
    }
}
