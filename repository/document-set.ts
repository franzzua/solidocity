import {Document} from "./document";
import {Reference} from "../contracts";
import {Collection} from "./collection";
import {ConstructorOf} from "./entity";

export type DocumentConstructor<TDocument extends Document> = ConstructorOf<TDocument, ConstructorParameters<typeof Document>> ;

export class DocumentSet<TDocument extends Document> {

    /** @internal **/
    constructor(private type: DocumentConstructor<TDocument>,
                private collection: Collection,
                private setField: string | symbol) {
    }

    public async Load(uri: Reference) {
        if (this.documentsMap.has(uri)) {
            await this.documentsMap.get(uri).Reload();
            return this.documentsMap.get(uri);
        }
        const document = new this.type(uri);
        //await document.Init();
        this.documentsMap.set(uri, document);
        return document;
    }

    private documentsMap = new Map<Reference, TDocument>();

    public get Documents(): ReadonlyArray<TDocument> {
        return [...this.documentsMap.values()];
    }

    public Update() {
        console.log('doc update');
    }

    public async Create(reference: Reference = `index.ttl`): Promise<TDocument> {
        const newDoc = new this.type(`${this.collection.folderURI}/${reference}`);

        await newDoc.Init();
        await this.collection.RegisterDoc(this.setField, newDoc);
        this.documentsMap.set(reference, newDoc);
        return newDoc;
    }

    async Clear() {
        for (const x of this.Documents) {
            await x.Remove();
        }
        this.documentsMap.clear();
    }
}