import "jest";
import {schema} from "rdf-namespaces";
import {Entity} from "../repository";
import {Document} from "../repository";
import {EntitySet} from "../repository";
import {ValuesSet} from "../repository";
import {entity, field, document, entityField} from "../repository";
import {currentSession, login} from "./auth";
import {ISession} from "../contracts";

const pod = 'https://fransua.inrupt.net';

let session: ISession;
let testDoc: TestEntityDocument;

@entity(`${pod}/types#test`)
class TestEntity extends Entity {
    @field(schema.Text)
    public Content: string;
    @field(schema.children, {isArray: true, type: "decimal", isOrdered: true})
    public readonly Children?: ValuesSet<number>;

}

@document()
class TestEntityDocument extends Document {
    @entityField(TestEntity, {isArray: true})
    public readonly Entities: EntitySet<TestEntity>;
}

describe('solid repository', () => {

    beforeAll(async () => {
        session = await currentSession() ?? await login();
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
});
