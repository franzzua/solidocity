import {createDocument, fetchDocument, TripleDocument} from "tripledoc";
import {Reference} from "../contracts";
import {ulid} from "ulid";
import {authFetch} from "../impl/auth";
import {RdfSubject} from "./RdfSubject";

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


    public getSubjectsOfType(type: Reference): ReadonlyArray<RdfSubject>{
        return this.tripleDoc.getAllSubjectsOfType(type)
            .map(subject => new RdfSubject(subject, this));
    }
    public getSubject(uri: Reference): RdfSubject{
        const tripleSubject = this.tripleDoc.getSubject(uri);
        if (!tripleSubject)
            return  this.addSubject(uri);
        return new RdfSubject(tripleSubject, this) ;
    }

    /** @internal **/
    public async CreateDocument(): Promise<void> {
        //await fs.createFolder(this.URI.split('/').slice(0, -1).join('/'));
        const doc = await createDocument(this.URI);
        this.tripleDoc = await doc.save();
    }


    addSubject(uri: Reference = `${this.URI}#${ulid()}`) {
        const [, id] = uri.split('#');
        const tripleSubject = this.tripleDoc.addSubject({
            identifier: id,
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


