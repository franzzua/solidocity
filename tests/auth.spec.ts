import "jest";
import {getSession} from "./helpers/auth";


it('should login', async () => {
    const session = await getSession();
    expect(session.webId).not.toBe(null);
});

