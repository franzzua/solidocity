import {Reference} from "../contracts";
import {RdfSubject} from "./RdfSubject";
import {RdfStore} from "./RdfStore";
import {DataFactory, Triple} from "n3";
import {RdfLink} from "./values/rdf-link";
import {Change} from "./change";

export interface IRdfRepository{
    load(): Promise<ReadonlyArray<Triple>>;
    saveChanges(change: Change<Triple>): Promise<void>;
    getAclRef();
    Subscribe(listener: (triples: ReadonlyArray<Triple>) => void): Promise<() => void>;
}

export class RdfDocument {
    public Store: RdfStore = new RdfStore();

    constructor(private repository: IRdfRepository) {
    }

    public LoadingPromise$: Promise<ReadonlyArray<Triple>> = Promise.resolve([]);
    public SavePromise$ = Promise.resolve();

    public async Load() {
        await this.LoadingPromise$;
        this.LoadingPromise$ = this.repository.load();
        const triples = await this.LoadingPromise$;
        this.Store.merge(triples);
    }

    public getSubjectsOfType(type: Reference): ReadonlyArray<RdfSubject> {
        return this.Store.Subjects.filter(x => x.Type == type);
        // return this.tripleDoc.getAllSubjectsOfType(type)
        //     .map(subject => new RdfSubject(subject, this));
    }

    public getSubject(uri: Reference): RdfSubject {
        const tripleSubject = this.Store.Subjects
            .find(x => x.URI == uri);
        if (!tripleSubject)
            return this.addSubject(uri);
        return tripleSubject;
    }

    addSubject(uri: Reference) {
        return this.Store.create(uri);
    }


    async Save() {
        await this.SavePromise$;
        this.SavePromise$ = (async () => {
            const changes = this.Store.getChanges();
            await this.repository.saveChanges(changes);
            this.Store.saveChanges();
        })();
        await this.SavePromise$;
    }


    public Link(subject: RdfSubject, predicate: Reference): RdfLink {
        return new RdfLink(this.Store, subject, DataFactory.namedNode(predicate));
    }

    public getAclRef(): Reference {
        return this.repository.getAclRef();
    }


    public async Subscribe(callback = () => {}): Promise<() => void>{
        return await this.repository.Subscribe((triples: ReadonlyArray<Triple>) => {
            this.Store.merge(triples);
            callback();
        });
    }

}


