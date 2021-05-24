import {Reference} from "../contracts";
import {merge} from "./merge";
import {BlankNode, Literal, Quad_Object, Quad_Subject, Store, Term, Triple} from "n3";
import {rdf, rdfs} from "rdf-namespaces";
import {DataFactory} from "n3";
import {RdfStore} from "./RdfStore";


// export type RdfValueType = Date | string | Reference | number;
type RdfMap = {
    "Date": Date;
    "string": string;
    "ref": Reference;
    "decimal": number;
}
export type RdfValueTypeName = "Date" | "string" | "ref" | "decimal";

export type RdfValueType<T extends RdfValueTypeName = RdfValueTypeName> = RdfMap[T];

export class RdfSubject {

    constructor(private subject: Quad_Subject,
                private store: RdfStore) {
        this.Type = this.triples.find(x => x.predicate.value == rdf.type)?.object?.value;
    }

    private get triples(){
        return this.store.triples.get(this.subject) ?? [];
    }

    public Type: Reference;
    public get URI() {return this.subject.value;}

    public getLinkedSubjects(predicate: Reference): ReadonlyArray<RdfSubject> {
        return this.triples
            .filter(x => x.predicate.value == predicate)
            .filter(x => x.object.termType == "BlankNode")
            .map(x => x.object as BlankNode)
            .map(x => this.store.getSubject(x));
    }

    addLinkedSubject(predicate: Reference) {
        const blankNode = DataFactory.blankNode();
        this.store.add([DataFactory.triple(
            this.subject,
            DataFactory.namedNode(predicate),
            blankNode
        )]);
        const newSubject = new RdfSubject(blankNode, this.store);
        this.store.Subjects.set(blankNode, newSubject);
        return newSubject;
    }
    removeLinkedSubject(predicate: Reference, subject: RdfSubject) {
        this.store.remove(this.triples.filter(x => x.predicate.value == predicate && x.object == subject.subject));
    }

    public setLinkedSubjects(predicate: Reference, subjects: ReadonlyArray<RdfSubject>) {
        const existed = this.triples.filter(x => x.predicate.value == predicate);
        const deleted = existed.filter(x => !subjects
            .some(y => x.object.equals(y.subject)));
        const added = subjects.filter(x => !existed.some(y => y.object.equals(x.subject)));
        this.store.remove(deleted);
        this.store.add(added.map(x => DataFactory.triple(
            this.subject,
            DataFactory.namedNode(predicate),
            x.subject
        )))
    }

    private convertFrom<T extends RdfValueTypeName>(value: RdfValueType<T>, type: T): Quad_Object{
        switch (type) {
            case "ref":
                return DataFactory.namedNode(value as string);
            case "string":
                return DataFactory.literal(value as string);
            case "decimal":
                if (Number.isInteger(value))
                    return DataFactory.literal(value.toString(), DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#integer'));
                return DataFactory.literal(value.toString(), DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#decimal'));
            case "Date":
                return DataFactory.literal((value as Date).toISOString(), DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#dateTime'));
        }
    }
    private convertTo<T extends RdfValueTypeName>(value: string, type: T): RdfValueType<T>{
        switch (type) {
            case "string":
                return value as RdfValueType<T>;
            case "Date":
                return new Date(value) as RdfValueType<T>;
            case "decimal":
                return +value as RdfValueType<T>;
            case "ref":
                return value as RdfValueType<T>;
        }
    }

    public getValue<T extends RdfValueTypeName>(predicate: Reference, type: T): RdfValueType<T> {
        const value = this.triples.find(x => x.predicate.value == predicate);
        if (!value)
            return null;
        return this.convertTo<T>(value.object.value, type);
    }

    public getValues<T extends RdfValueTypeName>(predicate: Reference, type: T): ReadonlyArray<RdfValueType<T>> {
        const values = this.triples.filter(x => x.predicate.value == predicate);
        return values.map(value => this.convertTo<T>(value.object.value, type));
    }

    public removeValue<T extends RdfValueTypeName>(predicate: Reference, type: T,
                                                   value: RdfValueType<T> = this.getValue(predicate, type)) {
        this.store.remove([this.triples.find(
            x => x.predicate.value == predicate
            && x.object.value == value)]);
    }

    public removeAllValues(predicate: Reference) {
        this.store.remove(this.triples.filter(
            x => x.predicate.value == predicate
                ));
    }

    public addValue<T extends RdfValueTypeName>(predicate: Reference, type: T, value: RdfValueType<T>) {
        if (value == null)
            return;
        this.store.add([
            DataFactory.triple(
                this.subject,
                DataFactory.namedNode(predicate),
                this.convertFrom(value, type)
            )
        ]);
        if (predicate === rdf.type)
            this.Type = value as Reference;
    }

    public setValue<T extends RdfValueTypeName>(predicate: Reference, type: T, value: RdfValueType<T>) {
        const oldValue = this.getValue(predicate, type);
        if (value == null && oldValue == null)
            return;
        if (oldValue == value)
            return;
        if (oldValue != null)
            this.removeValue(predicate, type, oldValue);
        this.addValue(predicate, type, value);
    }

    public setValues<T extends RdfValueTypeName>(predicate: Reference, type: T, newItems: RdfValueType<T>[]) {
        const oldValues = this.getValues<T>(predicate, type);
        if (!newItems || newItems.length == 0) {
            this.store.remove(this.triples.filter(x => x.predicate.value == predicate));
        } else if (oldValues.length == 0) {
            for (let newItem of newItems) {
                this.addValue(predicate, type, newItem);
            }
        } else {
            merge(newItems.sort(), oldValues,
                newValue => this.addValue(predicate, type, newValue),
                updValue => this.setValue(predicate, type, updValue),
                oldValue => this.removeValue(predicate, type, oldValue),
            );
        }
    }

    remove() {
        this.store.remove(this.triples);
    }

}
