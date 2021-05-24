// @ts-ignore
import { timeout, suite, test, beforeAll, afterAll} from "@testdeck/jest";
import {TestEntityDocument} from "./helpers/test.entity";
import {getSession, POD} from "./helpers/auth";
import {ISession} from "../contracts";

@suite
class OneDocsSpec {
    private session: ISession;
    private doc1: TestEntityDocument;

    @timeout(20000)
    async before(){
        this.session = await getSession();
        this.doc1 = new TestEntityDocument(`${POD}/tests/t1.ttl`);
        try {
            await this.doc1.Remove().catch();
        }catch (e) {

        }
        await this.doc1.Init()
        this.doc1.on('update', doc => {
            console.log('update', this.doc1.Entities.Items.map(x => x.Content));
        })
    }

    @test
    @timeout(20000)
    async world() {
        const entityA = this.doc1.Entities.Add();
        entityA.Content = 'A';
        entityA.Save();
        await this.doc1.Save();
        expect(this.doc1.Entities.get(entityA.Id).Content).toEqual(entityA.Content);
        entityA.Content = 'B';
        entityA.Save();
        await this.doc1.Save();
        expect(this.doc1.Entities.get(entityA.Id).Content).toEqual(entityA.Content);
    }

    @timeout(20000)
    async after(){
        await this.doc1.Remove()
    }
}
