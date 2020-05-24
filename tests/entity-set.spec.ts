import "jest";
import {schema} from "rdf-namespaces";
import {Entity} from "../repository";
import {Document} from "../repository";
import {EntitySet} from "../repository";
import {ValuesSet} from "../repository";
import {entity, field, document, entityField} from "../repository";
import {authService, ISession} from "../auth-service";

const pod = 'https://fransua.inrupt.net';

let session: ISession;
let testDoc: TestEntityDocument;

@entity(`${pod}/types#test`)
class TestEntity extends Entity {
    @field(schema.Text)
    public readonly Content: string;
    @field(schema.children, {isArray: true, type: "decimal", isOrdered: true})
    public readonly Children?: ValuesSet<number>;

}

@document()
class TestEntityDocument extends Document {
    @entityField(TestEntity, true)
    public readonly Entities: EntitySet<TestEntity>;
}

describe('solid repository', () => {

    beforeAll(async () => {
        session = await authService.GetSession();
        testDoc = new TestEntityDocument(`${pod}/tmp`);
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
    }, 20000);
});
