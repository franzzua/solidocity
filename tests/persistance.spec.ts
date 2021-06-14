import { timeout, suite, test} from "@testdeck/jest";
import {Document, document, Entity, entity, EntitySet, entitySet, field, ValuesSet} from "../repository";
import {schema} from "rdf-namespaces";


@suite
class PersistanceSpec{

    private testDoc: TestEntityDocument

    before(){

    }
}

const pod = 'https://fransua.inrupt.net';

@entity(`${pod}/types#test`)
export class TestEntity extends Entity {
    @field(schema.Text)
    public Content: string;
    @field(schema.children, {isArray: true, type: "decimal", isOrdered: true})
    public readonly Children?: ValuesSet<number>;

}

@document()
export class TestEntityDocument extends Document {

    constructor(url) {
        super(url, {
            createInNotExists: false,
            persistance: true
        });
    }

    @entitySet(TestEntity, {isArray: true})
    public readonly Entities: EntitySet<TestEntity>;

}
