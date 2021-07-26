import "jest";
import {timeout, suite, test} from "@testdeck/jest";
import {RdfSubject} from "../../rdf/RdfSubject";
import {DataFactory} from "n3";
import {ConflictError} from "../../rdf/values/rdf-scalar";

@suite
export class RdfSubjectSpec {


    @test
    scalar() {
        const predicate = "pred";
        const value = "Hi";
        const subj = new RdfSubject(DataFactory.namedNode("subj"), [
            DataFactory.triple(
                DataFactory.namedNode("subject"),
                DataFactory.namedNode(predicate),
                DataFactory.literal(value),
            )
        ]);
        const scalar = subj.Scalar(predicate, "string");
        expect(scalar.get()).toEqual(value);
        scalar.set('Hello');
        expect(scalar.get()).not.toEqual(value);
        const changes = subj.getChanges();
        expect(changes.remove).toHaveLength(1);
        expect(changes.add).toHaveLength(1);
        subj.merge([
            DataFactory.triple(
                DataFactory.namedNode("subject"),
                DataFactory.namedNode(predicate),
                DataFactory.literal('Whoa'),
            )
        ]);
        // const set = subj.Set(predicate, "string")
        // expect(set.get()).toHaveLength(2);
        // expect(set.get()).toEqual(["Hello", "Whoa"]);
        expect(scalar.conflict).not.toBeNull();
    }


    @test
    set() {
        const predicate = "pred";
        const value = "Hi";
        const subj = new RdfSubject(DataFactory.namedNode("subj"), []);
        const set = subj.Set(predicate, "string");
        expect(set.get()).toEqual([]);
        set.set([value]);
        expect(set.get()[0]).toEqual(value);
        const changes = subj.getChanges();
        expect(changes.add).toHaveLength(1);
        expect(changes.remove).toHaveLength(0);
        set.set(['Hello']);
        const changes2 = subj.getChanges();
        expect(changes2.add).toHaveLength(2);
        expect(changes2.add.map(x => x.object.value)).toEqual([value, "Hello"]);
        expect(changes2.remove).toHaveLength(0);
        subj.merge([
            DataFactory.triple(
                DataFactory.namedNode("subject"),
                DataFactory.namedNode(predicate),
                DataFactory.literal('Whoa'),
            )
        ]);
        expect(set.value).toHaveLength(3);
    }


}
