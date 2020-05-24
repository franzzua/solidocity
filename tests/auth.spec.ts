import "jest";
import {authService} from "../auth-service";


it('should login', async () => {
    const session = await authService.Auth();
    expect(session.webId).not.toBe(null);
});

it('should has session', async () => {
    const session = await authService.GetSession();
    expect(session.webId).not.toBe(null);
});
