// @ts-ignore
import { timeout, suite, test, beforeAll, afterAll} from "@testdeck/jest";
import {TestEntityDocument} from "./helpers/test.entity";
import {getSession, POD} from "./helpers/auth";
import {ISession} from "../contracts";

@suite
class TwoDocsSpec {
    private session: ISession;
    private doc1: TestEntityDocument;
    private doc2: TestEntityDocument;

    @timeout(20000)
    async before(){
        this.session = await getSession();
        this.doc1 = new TestEntityDocument(`${POD}/tests/t1.ttl`);
        try {
            await this.doc1.Remove().catch();
        }catch (e) {

        }
        this.doc2 = new TestEntityDocument(`${POD}/tests/t1.ttl`)
        await this.doc1.Init()
        await this.doc2.Init()
    }

    @test
    @timeout(20000)
    async world() {
        // await this.doc1.Subscribe(this.doc1.URI, () => console.log('update 1'));
        await this.doc2.Subscribe(this.doc2.URI, () => console.log('update 2'));
        const entityA1 = this.doc1.Entities.Add();
        entityA1.Content = 'A';
        entityA1.Save();
        const entityB2 = this.doc2.Entities.Add();
        entityB2.Content = 'B';
        entityB2.Save();
        expect(entityA1.Id).not.toBe(entityB2.Id);
        await this.doc2.Save();
        await this.doc1.Save();
        await this.doc2.Loading;
        const entityA2 = this.doc2.Entities.get(entityA1.Id);
        const entityB1 = this.doc1.Entities.get(entityB2.Id);
        // @ts-ignore
        expect(entityA2.Content).toEqual(entityA1.Content);
        expect(entityB2.Content).toEqual(entityB1.Content);

        // entityA1.Content = 'A1';
        entityA2.Content = 'A2';

        entityB1.Content = 'B1';
        // entityB2.Content = 'B2';

        [entityA1,entityA2,entityB1,entityB2].forEach(x => x.Save());

        await Promise.all([
            this.doc1.Save(),
            this.doc2.Save()
        ]);

        expect(entityA2.Content).toEqual(entityA1.Content);
        expect(entityB2.Content).toEqual(entityB1.Content);
    }

    @timeout(20000)
    async after(){
        //await this.doc1.Remove()
    }
}