import "jest";
import {AppContainer} from "../../container";
import {schema} from "rdf-namespaces";
import {AuthAppService, ISession} from "@app";
import {Entity} from "../repository";
import {Profile} from "../repository";
import {Document} from "../repository";
import {EntitySet} from "../repository";
import {ValuesSet} from "../repository";
import {SolidFileService} from "../contracts";
import {POD} from "../container";
import {entity, field, document, entityField} from "../repository";

const pod = 'https://fransua.inrupt.net';

AppContainer.provide([
    {provide: POD, useValue: pod},
]);
const authService = AppContainer.get<AuthAppService>(AuthAppService);
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
