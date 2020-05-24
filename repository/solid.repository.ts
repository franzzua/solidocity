import {createDocument, fetchDocument, Reference} from "tripledoc";
import {Inject} from "@hypertype/core";
import {Entity, EntityConstructor} from "./entity";
import {ItemsDocument} from "./document";
import {SolidFileService} from "../contracts";
import {POD} from "../container";

export class SolidRepository<TEntity extends Entity> {

    private docs: ItemsDocument<TEntity>[];
    private typeURI: Reference;
    private baseURI: Reference;

    constructor(private fc: SolidFileService,
                @Inject(POD) private pod: string,
                private type: EntityConstructor<TEntity>,
                private path: string
    ) {
        this.baseURI = `${pod}${path}`;
        this.typeURI = `${this.baseURI}/${type.name}.type`;
    }

    public async Init() {
        if (!(await this.fc.itemExists(this.baseURI)))
            await this.fc.createFolder(this.baseURI);
        const {files}: { files: { url }[] } = await this.fc.readFolder(this.baseURI);
        if (!files.length) {
            const url = `${this.baseURI}/index.ttl`;
            const doc = await createDocument(url);
            await doc.save();
            files.push({url});
        }
        this.docs = await Promise.all(
            files.map(async f => {
                const document = new ItemsDocument<TEntity>(f.url, this.type);
                await document.Init();
                return document;
            })
        );
    }

    public async Update(item: TEntity) {
        await item.Save();
        // const subject = this.instanceMap.get(item.Id);
        // this.metadata.Serialize(item, subject);
        // await (subject.getDocument() as TripleDocument).save();
    }

    public async Create(item: Omit<TEntity, keyof Entity>): Promise<TEntity> {
        const doc = this.docs[0];
        return doc.Create(item);

    }


    public async GetItems(): Promise<TEntity[]> {
        return this.docs.flatMap(d => d.Items);
    }

    public async Clear() {
        const {files} = await this.fc.readFolder(this.baseURI);
        for (let file of files) {
            await this.fc.deleteFile(file.url);
        }
        await this.Init();
    }
}

export type ConstructorOf<T, Params extends Array<any>> = {
    new(...args: Params): T;
}

export class Permission {
    User: Reference;

}



