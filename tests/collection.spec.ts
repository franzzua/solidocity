import {TestEntityCollection, TestEntityDocument} from "./helpers/test.entity";
import {getSession, POD} from "./helpers/auth";

describe('collection', ()=>{
    const collection = new TestEntityCollection(`${POD}/private/r2`);

    beforeAll(async ()=> {
        const session = await getSession();
         await collection.Init();
    }, 100000);

    it('can add doc', async () => {
        const doc = await collection.TestEntities.Create(`test.ttl`);
        const entity = doc.Entities.Add('test')
        entity.Content = 'hi';
        entity.Save();
        await doc.Save();

        // reload it
        await collection.Init();
        expect(collection.TestEntities.Documents.length).toBe(1);
        expect(collection.TestEntities.Documents[0].Entities.Items[0].Content).toBe(entity.Content);

    }, 200000);


    afterAll(async ()=> {
        await collection.Remove();
    }, 10000);

})
