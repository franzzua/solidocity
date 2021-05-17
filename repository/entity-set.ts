import {Entity, EntityConstructor} from "./entity";
import {BaseDocument} from "./base.document";
import {TripleSubject} from "tripledoc";
import {Metadata} from "./helpers/metadata";
import {Reference} from "../contracts";
import {RdfSubject} from "../rdf/RdfSubject";

export class EntitySet<TEntity extends Entity> {
    constructor(protected document: BaseDocument,
                protected itemConstructor: EntityConstructor<TEntity>,
                protected items: Map<Reference, TEntity> = new Map()) {
    }

    public get Items(): ReadonlyArray<TEntity> {
        return [...this.items.values()];
    }


    public Add(uri = undefined) {
        const subject = this.document.rdfDoc.addSubject(uri);
        const newItem = new this.itemConstructor(subject, this.document);
        this.items.set(newItem.Id, newItem);
        this._added.push(newItem);
        return newItem;
    }

    private _added: TEntity[] = [];
    private _removed: TEntity[] = [];

    public Remove(entity: TEntity){
        this._removed.push(entity);
    }

    Save(){
        for (let entity of this._added) {
            entity.Save();
        }
        for (let entity of this._removed){
            entity.Remove();
        }
    }

    /** @internal */
    Load(subjects: ReadonlyArray<RdfSubject>) {
        const entries: [Reference, TEntity][] =[
            ...subjects
                // .filter(x => !this._removed.includes(x.asRef()))
                .map(x => {
                    const item = this.items.get(x.URI) ?? this._added.find(a => a.Id == x.URI);
                    if (item) {
                        // item.Load();
                        return item;
                    }
                    // console.log('new item', x.asRef());
                    return new this.itemConstructor(x, this.document)
                })
                .map(x => [x.Id, x] as [Reference, TEntity]),
            // ...this._added
            //     .map(x => [x, this.items.get(x)] as [Reference, TEntity])
        ];
        this.items = new Map(entries);
        // console.log('load entity set', entries.length, this._added.length);
    }

    public Preload() {
        this._added = [];
        this._removed = [];
    }

    public get(id: Reference): TEntity {
        return this.items.get(id) ?? this._added.find(x => x.Id == id);
    }
}

/** @internal **/
export class FieldEntitySet<TEntity extends Entity> extends EntitySet<TEntity> {
    private docSet: EntitySet<TEntity>;

    /** @internal **/
    constructor(document: BaseDocument, itemConstructor: EntityConstructor<TEntity>,
                private subj: RdfSubject) {
        super(document, itemConstructor);
        this.docSet = new EntitySet(document, itemConstructor);
    }


    public get Items(): ReadonlyArray<TEntity> {
        return [
            ...super.Items,
            ...this.docSet.Items
        ];
    }


    public Add(id = undefined) {
        const result = super.Add(id);
        const info = Metadata.Entities.get(this.itemConstructor);
        this.subj.addValue(info.TypeReference, "ref", result.Id);
        return result;
    }

    /** @internal */
    Load(subjects: ReadonlyArray<RdfSubject>) {
        const info = Metadata.Entities.get(this.itemConstructor);
        const refs = this.subj.getValues(info.TypeReference, "ref");
        const docSubjects = refs.map(ref => this.document.rdfDoc.getSubject(ref));
        this.docSet.Load(docSubjects);
        super.Load(subjects);
    }
}
