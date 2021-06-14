import {DataFactory, Quad_Object, Quad_Predicate, Triple} from "n3";
import {RdfSubject} from "../RdfSubject";
import {Reference} from "../../contracts";

type RdfMap = {
    "Date": Date;
    "string": string;
    "ref": Reference;
    "decimal": number;
}
export type RdfValueTypeName = "Date" | "string" | "ref" | "decimal";
export type RdfValueType<T extends RdfValueTypeName = RdfValueTypeName> = RdfMap[T];

export abstract class RdfObject<T extends RdfValueType> {
    protected triples: Triple[];

    constructor(protected subject: RdfSubject,
                protected predicate: Quad_Predicate,
                protected type: RdfValueTypeName) {
        this.triples = this.subject.triples.filter(x => x.predicate.equals(predicate));
    }

    toRDF(value: T): Quad_Object {
        switch (this.type) {
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

    toJS(value: Quad_Object): T {
        switch (this.type) {
            case "string":
                return value.value as T;
            case "Date":
                return new Date(value.value) as T;
            case "decimal":
                return +value.value as T;
            case "ref":
                return value.value as T;
        }
    }

    setType<N extends RdfValueTypeName>(type: RdfValueTypeName) {
        this.type = type;
    }

    toTriple = value => DataFactory.triple(
        this.subject.subject,
        this.predicate,
        this.toRDF(value)
    );
}
