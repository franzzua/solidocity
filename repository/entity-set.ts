import {Entity, EntityConstructor} from "./entity";
import {BaseDocument} from "./base.document";
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
        return newItem;
    }


    public Remove(entity: TEntity){
        this.items.delete(entity.Id);
        this.document.rdfDoc.removeSubject(entity.Id);
    }

    /** @internal */
    Load(subjects: ReadonlyArray<RdfSubject>) {
        const entries = subjects
            .map(x => {
                const item = this.items.get(x.URI);
                if (item) {
                    item.Subject = x;
                    item.Load();
                    return item;
                }
                return new this.itemConstructor(x, this.document)
            })
            .map(x => [x.Id, x] as [Reference, TEntity]);
        this.items = new Map(entries);
        // console.log('load entity set', entries.length, this._added.length);
    }

    public get(id: Reference): TEntity {
        return this.items.get(id);
    }
}

/** @internal **/
export class FieldEntitySet<TEntity extends Entity> extends EntitySet<TEntity> {
    // private docSet: EntitySet<TEntity>;

    /** @internal **/
    constructor(document: BaseDocument, itemConstructor: EntityConstructor<TEntity>,
                private subj: RdfSubject, private predicate: Reference) {
        super(document, itemConstructor);
        // this.docSet = new EntitySet(document, itemConstructor);
    }


    public get Items(): ReadonlyArray<TEntity> {
        return [
            ...super.Items,
            // ...this.docSet.Items
        ];
    }


    public Add(id = undefined) {
        const subject = this.subj.addLinkedSubject(this.predicate);
        const result = new this.itemConstructor(subject, this.document);
        this.items.set(result.Id, result);
        // const info = Metadata.Entities.get(this.itemConstructor);
        // this.subj.addValue(info.TypeReference, "ref", result.Id);
        return result;
    }

    public Remove(entity: TEntity){
        this.items.delete(entity.Id);
        this.subj.removeLinkedSubject(this.predicate, entity.Subject) ;
    }

    /** @internal */
    Load(subjects: ReadonlyArray<RdfSubject>) {
        // const info = Metadata.Entities.get(this.itemConstructor);
        // const refs = this.subj.getValues(info.TypeReference, "ref");
        // const docSubjects = refs.map(ref => this.document.rdfDoc.getSubject(ref));
        // this.docSet.Load(docSubjects);
        super.Load(subjects);
    }
}
