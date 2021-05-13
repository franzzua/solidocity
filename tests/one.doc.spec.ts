// @ts-ignore
import { timeout, suite, test, beforeAll, afterAll} from "@testdeck/jest";
import {TestEntityDocument} from "./helpers/test.entity";
import {getSession, POD} from "./helpers/auth";
import {ISession} from "../contracts";

@suite
class TwoDocsSpec {
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
    @timeout(100000)
    async world() {
        const entityA = this.doc1.Entities.Add();
        entityA.Content = 'A';
        // entityA.Save();
        await this.doc1.Save();
        // @ts-ignore
        expect(this.doc1.Entities.get(entityA.Id)).toEqual(entityA);
        expect(entityA.Content).toEqual('A');
        const saves: Promise<void>[] = [];
        for (let i = 0; i < 3; i++){
            const value = `A${i}`;
            // console.log(value)
            entityA.Content = value;
            entityA.Save();
            saves.push(this.doc1.Save());
            await new Promise(resolve => setTimeout(resolve, Math.random()*300+100));
            expect(this.doc1.Entities.get(entityA.Id)).toStrictEqual(entityA);
            expect(entityA.Content).toEqual(value);
        }

        await Promise.all('saves');

    }

    @timeout(20000)
    async after(){
        //await this.doc1.Remove()
    }
}
