import "jest";
import { getSession} from "./helpers/auth";
import {ISession} from "../contracts";
import {TestEntityDocument} from "./helpers/test.entity";

const pod = 'https://fransua.inrupt.net';

let session: ISession;
let testDoc: TestEntityDocument;

describe('solid repository', () => {

    beforeAll(async () => {
        session = await getSession();
        testDoc = new TestEntityDocument(`${pod}/tmp/test.ttl`);
        await testDoc.Init();
    }, 10000);

    it('can add items', async () => {
        const entity = await testDoc.Entities.Add();
        entity.Assign({
            Content: '1',
        });
        entity.Children.Push(1, 2, 3);
        entity.Children.Reorder(2,1);
        entity.Save();
        await entity.Document.Save()
        entity.Content = 'adasd';
        entity.Save();
        await entity.Document.Save()
        entity.Content = '1231231';
        entity.Save();
        await entity.Document.Save()
    }, 20000);

    afterAll(async () => {
        await testDoc.Remove();
    })
});
