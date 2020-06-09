import "jest";
import {getSession} from "./auth";


it('should login', async () => {
    const session = await getSession();
    expect(session.webId).not.toBe(null);
});

