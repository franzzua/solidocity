import {suite, test} from "@testdeck/jest"
import {Entity, entity, EntityConflicts, EntityFields, EntitySet, field} from "../../repository";
import {RdfDocument} from "../../rdf/RdfDocument";
import {MockRdfRepository} from "../rdf/mock.rdf-repository";

@entity('test-entity')
class TestEntity extends Entity{

    @field('predicate', {type: "string"})
    public Value: string;

    @field('predicates', {type: "decimal", isArray: true})
    public Values: number[];

    public Merge(other: EntityFields<this>, conflicts: EntityConflicts<this>) {
        const resolved = {} as EntityFields<this>;
        if ('Value' in conflicts){
            const initial = conflicts.Value.initial;
            resolved.Value = initial
                + this.Value.replace(initial, '')
                + conflicts.Value.remote.replace(initial, '')
        }
        if ('Values' in conflicts){
            resolved.Values = [
                ...conflicts.Values.remote,
            ];
        }
        return resolved;
    }
}

@suite
export class EntitySetSpec{

    private repo = new MockRdfRepository([]);
    private doc1 = new RdfDocument(this.repo);
    private doc2 = new RdfDocument(this.repo);
    private entitySet = new EntitySet(this.doc1, TestEntity);

    @test
    public async addItems(){
        const entity = this.entitySet.Add();
        entity.Value = 'hi';
        entity.Save();
        await this.doc1.Save();
        await this.doc2.Load();
        this.entitySet.Load(this.doc2.getSubjectsOfType('test-entity'));
        const loadedEntity = this.entitySet.get(entity.Id);
        expect(loadedEntity).not.toBeNull();
    }
}
