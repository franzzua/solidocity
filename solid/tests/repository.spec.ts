import {exec} from "child_process";
import * as path from "path";
import "jest";
import {AppContainer} from "../../container";
import {schema} from "rdf-namespaces";
import {AuthAppService} from "@app";
import {Entity} from "../repository";
import {Document} from "../repository";
import {entity, field, document, entityField, SolidRepository} from "../repository";
import {Reference, SolidFileService} from "../contracts";
import {POD} from "../container";
// import {fetch,init} from './solidFileFetch';
// import {existsSync, mkdirSync} from "fs";
// import  auth from '../solid/impl/fetch.impl';

// auth.fetch = fetch;
const pod = 'https://fransua.inrupt.net';

@entity(`${pod}/types#test`)
class TestEntity extends Entity{
    @field(schema.Text)
    public Content: string;
    @field(schema.children, {isArray: true, type: "ref"})
    public Children?: Reference[];
}

@document()
class TestEntityDocument extends Document{
    @entityField(TestEntity, true)
    public Entities: TestEntity[]
}

// const root = path.join(__dirname, '.tmp');
// init(pod, root);

// if (!existsSync(root)) {
//     mkdirSync(root);
// }
AppContainer.provide([
    {provide: POD, useValue: pod},
]);
const fs = AppContainer.get<SolidFileService>(SolidFileService);
const repository = new SolidRepository<TestEntity>(fs, pod, TestEntity, '/public');
const authService = AppContainer.get<AuthAppService>(AuthAppService);
describe('solid repository', () => {

    beforeAll(async () => {
        await authService.Auth();
        await repository.Init();
    }, 10000);

    beforeEach(async () => {
    }, 10000);

    it('should create entity', async () => {
        const entity = await repository.Create({
            Content: 'Abra kadabra',
        });
        const items = await repository.GetItems();
        expect(items[0].Content).toBe(entity.Content);
        expect(entity.Id).not.toBe(null);

    }, 20000);


    it('should save arrays', async () => {
        const createItems = [{
            Content: 'Abra kadabra 1',
        }, {
            Content: 'Abra kadabra 2',
        }, {
            Content: 'Abra kadabra 3',
        }];
        const entities = await Promise.all(
            createItems.map(x => repository.Create(x))
        );
        entities[0].Children = [entities[1].Id, entities[2].Id];
        await repository.Update(entities[0]);
        await repository.Init();
        const items = await repository.GetItems();
        const parent = items.find(x => x.Id == entities[0].Id);
        expect(parent.Children).toEqual([entities[1].Id, entities[2].Id].orderBy(x => x));
    }, 20000);

    afterAll(async () => {
        // exec(`rm -rf ${path.join(__dirname, '.tmp')}`)
    });
});
