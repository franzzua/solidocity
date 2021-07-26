import {AclDocument} from "./acl/acl.document";
import {Constructor, Metadata} from "./helpers/metadata";
import {Entity, EntityConstructor} from "./entity";
import {BaseDocument} from "./base.document";
import {Reference} from "../contracts";
import {ulid} from "ulid";

export class Document extends BaseDocument {

    public async Init(...types: Constructor[]) {
        await super.Init();
        const acl = this.rdfDoc.getAclRef();
        if (acl)
            this.Acl = new AclDocument(acl, this.URI);
        // await this.Acl.Init();
    }

    public Acl: AclDocument;
    //
    // /** @internal **/
    // protected async CreateDocument(): Promise<TripleDocument> {
    //     //await fs.createFolder(this.URI.split('/').slice(0, -1).join('/'));
    //     const doc = await createDocument(this.URI);
    //     return await doc.save();
    // }
    //


}

export class ItemsDocument<TEntity extends Entity> extends Document {

    constructor(docURI: Reference, private type: EntityConstructor<TEntity>) {
        super(docURI);
    }

    public async Init() {
        await super.Init();
        await this.LoadItems(this.type)
    }

    private async LoadItems(type: Constructor) {
        const info = Metadata.Entities.get(type);
        const subjects = this.rdfDoc.getSubjectsOfType(info.TypeReference);
        this.Items = subjects.map(x => new type(x, this));
    }


    public Items: TEntity[];

    public async Create(item: Omit<TEntity, keyof Entity>): Promise<TEntity> {
        const subject = this.rdfDoc.addSubject(`${this.URI}#${ulid()}`);
        const newItem = new this.type(subject, this.rdfDoc) as TEntity;
        Object.assign(newItem, item);
        newItem.Save();
        await this.rdfDoc.Save();
        return newItem;
    }
}
