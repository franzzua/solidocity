import {AclDocument} from "./acl.document";
import {Constructor, Metadata} from "./metadata";
import {Entity, EntityConstructor} from "./entity";
import {BaseDocument} from "./base.document";
import {createDocument, TripleDocument} from "tripledoc";
import {Reference} from "../contracts";
import {fs} from "../impl/file.service";

export class Document extends BaseDocument {

    public async Init(...types: Constructor[]) {
        await super.Init();
        this.Acl = new AclDocument(this.doc.getAclRef(), this);
        await this.Acl.Init();
    }

    public Acl: AclDocument;

    /** @internal **/
    protected async CreateDocument(): Promise<TripleDocument> {
        await fs.createFolder(this.URI.split('/').slice(0, -1).join('/'));
        const doc = await createDocument(this.URI);
        return await doc.save();
    }

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
        const subjects = this.doc.getAllSubjectsOfType(info.TypeReference);
        this.Items = subjects.map(x => new type(x, this));
    }


    public Acl: AclDocument;

    public Items: TEntity[];

    public async Create(item: Omit<TEntity, keyof Entity>): Promise<TEntity> {
        const subject = this.doc.addSubject();
        const newItem = new this.type(subject.asRef(), this) as TEntity;
        Object.assign(newItem, item);
        newItem.Save();
        await this.doc.save();
        newItem.Id = subject.asRef();
        return newItem;
    }
}
