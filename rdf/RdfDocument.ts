import {createDocument, fetchDocument, TripleDocument, TripleSubject} from "tripledoc";
import {Reference} from "../contracts";
import {IFieldInfo} from "../repository/helpers/metadata";
import {merge} from "./merge";
import {ulid} from "ulid";
import {authFetch} from "../impl/auth";

export class RdfDocument {
    private tripleDoc: TripleDocument;


    constructor(public URI: Reference, private options: {
        createIfNotExists: boolean
    } = {
        createIfNotExists: true
    }) {
    }

    public Loading = Promise.resolve();

    public async Load() {
        await this.Loading;
        this.Loading = new Promise<void>(async (resolve, reject) => {
            try {
                this.tripleDoc = await fetchDocument(this.URI);
            } catch (e) {
                if (this.options.createIfNotExists) {
                    await this.CreateDocument();
                }
            }
            resolve();
        });
        await this.Loading;
    }


    public getSubjects(subject: Reference): ReadonlyArray<RdfSubject>{
        return this.tripleDoc.getAllSubjectsOfType(subject)
            .map(subject => new RdfSubject(subject, this));
    }
    public getSubject(subject: Reference): RdfSubject{
        const tripleSubject = this.tripleDoc.getSubject(subject);
        if (!tripleSubject)
            return  this.addSubject(subject);
        return new RdfSubject(tripleSubject, this) ;
    }

    /** @internal **/
    public async CreateDocument(): Promise<void> {
        //await fs.createFolder(this.URI.split('/').slice(0, -1).join('/'));
        const doc = await createDocument(this.URI);
        this.tripleDoc = await doc.save();
    }


    addSubject(subject: Reference = `${this.URI}#${ulid()}`) {
        const [prefix, id] = subject.split('#');
        const tripleSubject = this.tripleDoc.addSubject({
            identifier: id,
            identifierPrefix: prefix
        });
        return new RdfSubject(tripleSubject, this);
    }

    removeSubject(uri: Reference) {
        this.tripleDoc.removeSubject(uri);
    }

    private SavePromise$ = Promise.resolve();

    async Save() {
        await (this.SavePromise$ = new Promise<void>(async resolve => {
            try {
                this.tripleDoc = await this.tripleDoc.save();
            } catch (e) {
                if (e.status == '409') {
                    await this.Load();
                    this.tripleDoc = await this.tripleDoc.save();
                }else{
                    throw e;
                }
            }
            resolve();
        }));
    }

    async getWebSocketRef() {
        const wssUrl = this.tripleDoc.getWebSocketRef();
        if (wssUrl != null) {
            return wssUrl;
        }
        const res = await authFetch(this.URI, {method: 'HEAD'});
        if (res.headers.has('updates-via')) {
            return res.headers.get('updates-via');
        }
        throw new Error("failed to find wssUrl");
    }

    getAclRef() {
        return this.tripleDoc.getAclRef();
    }
}

export type RdfValueType = Date | string | Reference | number;
export type RdfValueTypeName = "Date" | "string" | "ref" | "decimal";



export class RdfSubject{

    public get URI(): Reference{
        return this.subject.asRef();
    }

    constructor(private subject: TripleSubject,
                private document: RdfDocument) {

    }

    public getLinkedSubject(predicate: Reference){
        const subject = this.subject.getLocalSubject(predicate);
    }


    public getValue(predicate: Reference, type: RdfValueTypeName): RdfValueType {
        switch (type){
            case "string":
                return this.subject.getString(predicate);
            case "Date":
                return this.subject.getDateTime(predicate);
            case "ref":
                return this.subject.getRef(predicate);
            case "decimal":
                return this.subject.getDecimal(predicate);
        }
    }
    public getValues(predicate: Reference, type: RdfValueTypeName): RdfValueType[] {
        switch (type){
            case "string":
                return this.subject.getAllStrings(predicate).orderBy(x => x);
            case "Date":
                return this.subject.getAllDateTimes(predicate).orderBy(x => +x);
            case "ref":
                return this.subject.getAllRefs(predicate).orderBy(x => x);
            case "decimal":
                return this.subject.getAllDecimals(predicate).orderBy(x => x);
        }
    }

    public removeValue(predicate: Reference, type: RdfValueTypeName,
                       value: RdfValueType = this.getValue(predicate, type)) {
        switch (type){
            case "string":
                return this.subject.removeString(predicate, value as string);
            case "Date":
                return this.subject.removeDateTime(predicate, value as Date);
            case "ref":
                return this.subject.removeRef(predicate, value as Reference);
            case "decimal":
                return this.subject.removeDecimal(predicate, value as number);
        }
    }

    public removeAllValues(predicate: Reference) {
        return this.subject.removeAll(predicate);
    }
    public addValue(predicate: Reference, type: RdfValueTypeName, value: RdfValueType) {
        switch (type){
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

    public setValue(predicate: Reference, type: RdfValueTypeName, value: RdfValueType) {
        const oldValue = this.getValue(predicate, type);
        if (value == null && oldValue == null)
            return;
        if (value == null && oldValue != null)
            return this.removeValue(predicate, type, oldValue);
        switch (type){
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

    public setValues(predicate: Reference, type: RdfValueTypeName, newItems: RdfValueType[]){
        const oldValues = this.getValues(predicate, type);
        if (!newItems || newItems.length == 0) {
            this.subject.removeAll(predicate);
        } else if (oldValues.length == 0) {
            for (let newItem of newItems) {
                this.addValue(predicate, type, newItem);
            }
        }else{
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

export class Triplet<T extends RdfValueType> {
    public Subject: Reference;
    public Predicate: Reference;
    public Value: T
}