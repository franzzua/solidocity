import {Reference} from "../contracts";
import {TripleSubject} from "tripledoc";
import {merge} from "./merge";
import {RdfDocument} from "./RdfDocument";

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

    public get URI(): Reference {
        return this.subject.asRef();
    }

    constructor(private subject: TripleSubject,
                private document: RdfDocument) {

    }

    public getLinkedSubject(predicate: Reference) {
        const subject = this.subject.getLocalSubject(predicate);
    }
    public getLinkedSubjects(predicate: Reference) {
        const subjects = this.subject.getAllLocalSubjects(predicate);
        return subjects.map(x => new RdfSubject(x, this.document));
    }


    public getValue<T extends RdfValueTypeName>(predicate: Reference, type: T): RdfValueType<T> {
        switch (type) {
            case "string":
                return this.subject.getString(predicate) as RdfValueType<T>;
            case "Date":
                return this.subject.getDateTime(predicate) as RdfValueType<T>;
            case "ref":
                return this.subject.getRef(predicate) as RdfValueType<T>;
            case "decimal":
                return this.subject.getDecimal(predicate) as RdfValueType<T>;
        }
    }

    public getValues<T extends RdfValueTypeName>(predicate: Reference, type: T): ReadonlyArray<RdfValueType<T>> {
        switch (type) {
            case "string":
                return this.subject.getAllStrings(predicate).orderBy(x => x) as RdfValueType<T>[];
            case "Date":
                return this.subject.getAllDateTimes(predicate).orderBy(x => +x) as RdfValueType<T>[];
            case "ref":
                return this.subject.getAllRefs(predicate).orderBy(x => x) as RdfValueType<T>[];
            case "decimal":
                return this.subject.getAllDecimals(predicate).orderBy(x => x) as RdfValueType<T>[];
        }
    }

    public removeValue<T extends RdfValueTypeName>(predicate: Reference, type: T,
                       value: RdfValueType<T> = this.getValue(predicate, type)) {
        switch (type) {
            case "string":
                return this.subject.removeString(predicate, value as string);
            case "Date":
                return this.subject.removeDateTime(predicate, value as Date);
            case "ref":
                return this.subject.removeRef(predicate, value as string);
            case "decimal":
                return this.subject.removeDecimal(predicate, value as number);
        }
    }

    public removeAllValues(predicate: Reference) {
        return this.subject.removeAll(predicate);
    }

    public addValue<T extends RdfValueTypeName>(predicate: Reference, type: T, value: RdfValueType<T>) {
        switch (type) {
            case "object":
            case "string":
                return this.subject.addString(predicate, value as string);
            case "Date":
                return this.subject.addDateTime(predicate, value as Date);
            case "ref":
                return this.subject.addRef(predicate, value as Reference);
            case "decimal":
                return this.subject.addDecimal(predicate, value as number);
        }
    }

    public setValue<T extends RdfValueTypeName>(predicate: Reference, type: T, value: RdfValueType<T>) {
        const oldValue = this.getValue(predicate, type);
        if (value == null && oldValue == null)
            return;
        if (value == null && oldValue != null)
            return this.removeValue(predicate, type, oldValue);
        switch (type) {
            case "string":
                return this.subject.setString(predicate, value as string);
            case "Date":
                return this.subject.setDateTime(predicate, value as Date);
            case "ref":
                return this.subject.setRef(predicate, value as Reference);
            case "decimal":
                return this.subject.setDecimal(predicate, value as number);
        }
    }

    public setValues<T extends RdfValueTypeName>(predicate: Reference, type: T, newItems: RdfValueType<T>[]) {
        const oldValues = this.getValues<T>(predicate, type);
        if (!newItems || newItems.length == 0) {
            this.subject.removeAll(predicate);
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
        this.document.removeSubject(this.URI);
    }
}