import {
    collection,
    Document,
    document,
    documentSet,
    Entity,
    entity,
    entitySet,
    EntitySet,
    field,
    ValuesSet
} from "../repository";
import {schema} from "rdf-namespaces";
import {Collection} from "../repository/collection";
import {DocumentSet} from "../repository/document-set";

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
    @entitySet(TestEntity, {isArray: true})
    public readonly Entities: EntitySet<TestEntity>;

}

@collection()
export class TestEntityCollection extends Collection {

    @documentSet(TestEntityDocument)
    public TestEntities: DocumentSet<TestEntityDocument>;
}