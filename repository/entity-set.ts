import {Entity, EntityConstructor} from "./entity";
import {BaseDocument} from "./base.document";
import {TripleSubject} from "tripledoc";
import {Metadata} from "./metadata";
import {Reference} from "../contracts";
import { rdf } from "rdf-namespaces";

export class EntitySet<TEntity extends Entity> {
    constructor(protected document: BaseDocument,
                protected itemConstructor: EntityConstructor<TEntity>,
                protected items: Map<Reference, TEntity> = new Map()) {
    }

    public get Items(): ReadonlyArray<TEntity> {
        return [...this.items.values()];
    }


    public Add(id = undefined) {
        const subject = this.document.doc.addSubject({
            identifier: id?.split('#').pop()
        });
        const newItem = new this.itemConstructor(subject.asRef(), this.document);
        this.items.set(newItem.Id, newItem);
        this._added.push(newItem);
        return newItem;
    }

    private _added: TEntity[] = [];
    private _removed: TEntity[] = [];

    public Remove(id){
        this._removed.push(id);
    }

    Preload(){
        for (let entity of this._added) {
            if (!entity.Subject) {
                const [prefix, id] = entity.Id.split('#');
                const subject = this.document.doc.addSubject({
                    identifier: id,
                    identifierPrefix: prefix
                });
            }
            entity.Save();
            // console.log('add', entity.Subject.getRef(rdf.type));
        }
        for (let entity of this._removed){
            if (entity.Subject) {
                entity.Remove();
            }
        }
    }

    /** @internal */
    Load(subjects: TripleSubject[]) {
        const entries: [Reference, TEntity][] =[
            ...subjects
                // .filter(x => !this._removed.includes(x.asRef()))
                .map(x => {
                    const item = this.items.get(x.asRef()) ?? this._added.find(a => a.Id == x.asRef());
                    if (item) {
                        // item.Load();
                        return item;
                    }
                    console.log('new item', x.asRef());
                    return new this.itemConstructor(x.asRef(), this.document)
                })
                .map(x => [x.Id, x] as [Reference, TEntity]),
            // ...this._added
            //     .map(x => [x, this.items.get(x)] as [Reference, TEntity])
        ];
        this.items = new Map(entries);
        // console.log('load entity set', entries.length, this._added.length);
    }

    public Save() {
        this._added = [];
        this._removed = [];
    }

    public get(id: Reference): TEntity {
        return this.items.get(id);
    }
}

/** @internal **/
export class FieldEntitySet<TEntity extends Entity> extends EntitySet<TEntity> {
    private docSet: EntitySet<TEntity>;

    /** @internal **/
    constructor(document: BaseDocument, itemConstructor: EntityConstructor<TEntity>, private subj: TripleSubject) {
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
        this.subj.addRef(info.TypeReference, result.Id);
        return result;
    }

    /** @internal */
    Load(subjects: TripleSubject[]) {
        const info = Metadata.Entities.get(this.itemConstructor);
        const refs = this.subj.getAllRefs(info.TypeReference);
        const docSubjects = refs.map(ref => this.document.doc.getSubject(ref));
        this.docSet.Load(docSubjects);
        super.Load(subjects);
    }
}