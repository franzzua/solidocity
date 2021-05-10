import "jest";
import {getSession, POD} from "./helpers/auth";
import {ISession} from "../contracts";
import {TestEntityDocument} from "./helpers/test.entity";


let session: ISession;
let testDoc: TestEntityDocument;

describe('solid repository', () => {

    beforeAll(async () => {
        session = await getSession();
        testDoc = new TestEntityDocument(`${POD}/test.ttl`);
        await testDoc.Init();
    }, 20000);

    it('can add items', async () => {
        let entity = await testDoc.Entities.Add(`${testDoc.URI}#1`);
        // entity.Assign({
        //     Content: '1',
        // });
        entity.Save();
        entity = testDoc.Entities.get(`${testDoc.URI}#1`);
        entity.Content = '2';
        const promise = entity.Document.Save()
        entity = testDoc.Entities.get(`${testDoc.URI}#1`);
        entity.Content = '3';
        await promise;
        entity = testDoc.Entities.get(`${testDoc.URI}#1`);
        entity.Children.Push(1, 2, 3);
        entity.Children.Reorder(2,1);
        entity.Save();
        await entity.Document.Save()
        expect(testDoc.Entities.get(`${testDoc.URI}#1`)).toEqual(entity);
        entity.Content = 'adasd';
        entity.Save();
        await entity.Document.Save()
        expect(testDoc.Entities.get(`${testDoc.URI}#1`)).toEqual(entity);
        entity.Content = '1231231';
        entity.Save();
        await entity.Document.Save()
        expect(testDoc.Entities.get(`${testDoc.URI}#1`)).toEqual(entity);
    }, 20000);

    afterAll(async () => {
        await testDoc.Remove();
    })
});
