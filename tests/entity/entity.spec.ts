import {suite, test} from "@testdeck/jest"
import {RdfSubject} from "../../rdf/RdfSubject";
import {DataFactory} from "n3";
import {entity, Entity, EntityConflicts, EntityFields, field} from "../../repository";

@entity('subject')
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
export class EntitySpec{

    private value = 'value';

    subject = new RdfSubject(DataFactory.namedNode('subject'), [
        DataFactory.triple(
            DataFactory.namedNode('subject'),
            DataFactory.namedNode('predicate'),
            DataFactory.literal(this.value)
        )
    ]);


    @test
    scalarConflicts(){
        const entity = new TestEntity(this.subject, null);
        entity.Load();
        expect(entity.Value).toBe(this.value);
        entity.Value = 'value 2';
        entity.Save();
        const entity2 = new TestEntity(this.subject, null);
        entity2.Load();
        expect(entity2.Value).toBe(entity.Value);
        this.subject.merge([
            DataFactory.triple(
                DataFactory.namedNode('subject'),
                DataFactory.namedNode('predicate'),
                DataFactory.literal('value 3')
            )
        ]);
        entity2.Load();
        expect(entity2.Value).toBe('value 2 3');
    }

    @test
    setConflicts(){
        const entity = new TestEntity(this.subject, null);
        entity.Load();
        expect(entity.Values).toStrictEqual([]);
        entity.Values.push(1)
        entity.Save();
        const entity2 = new TestEntity(this.subject, null);
        entity2.Load();
        expect(entity2.Values).toStrictEqual(entity.Values);
        this.subject.merge([
            DataFactory.triple(
                DataFactory.namedNode('subject'),
                DataFactory.namedNode('predicates'),
                DataFactory.literal(2)
            )
        ]);
        entity2.Load();
        expect(entity2.Values).toContain(1);
        expect(entity2.Values).toContain(2);
    }
}
