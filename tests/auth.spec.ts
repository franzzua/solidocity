import "jest";
import {AppContainer} from "../container";
import {AuthAppService} from "@app";


const authAppService = AppContainer.get<AuthAppService>(AuthAppService);

it('should login', async () => {
    const session = await authAppService.Auth();
    expect(session.webId).not.toBe(null);
});

it('should has session', async () => {
    const session = await authAppService.GetSession();
    expect(session.webId).not.toBe(null);
});
