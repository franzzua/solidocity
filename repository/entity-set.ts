import {Entity, EntityConstructor} from "./entity";
import {Reference} from "../contracts";
import {RdfSubject} from "../rdf/RdfSubject";
import {RdfDocument} from "../rdf/RdfDocument";

export class EntitySet<TEntity extends Entity> {
    constructor(protected rdfDoc: RdfDocument,
                protected itemConstructor: EntityConstructor<TEntity>,
                protected items: Map<Reference, TEntity> = new Map()) {
    }

    public get Items(): ReadonlyArray<TEntity> {
        return [...this.items.values()];
    }


    public Add(uri = undefined) {
        const subject = this.rdfDoc.addSubject(uri);
        const newItem = new this.itemConstructor(subject, this.rdfDoc);
        this.items.set(newItem.Id, newItem);
        return newItem;
    }


    public Remove(entity: TEntity){
        this.items.delete(entity.Id);
        entity.Subject.Remove();
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
                return new this.itemConstructor(x, this.rdfDoc)
            })
            .map(x => [x.Id, x] as [Reference, TEntity]);
        this.items = new Map(entries);
        // console.log('load entity set', entries.length, this._added.length);
    }

    public get(uri: Reference): TEntity {
        return this.items.get(uri);
    }
}

/** @internal **/
export class FieldEntitySet<TEntity extends Entity> extends EntitySet<TEntity> {
    // private docSet: EntitySet<TEntity>;

    /** @internal **/
    constructor(document: RdfDocument, itemConstructor: EntityConstructor<TEntity>,
                private subj: RdfSubject, private predicate: Reference) {
        super(document, itemConstructor);
        // this.docSet = new EntitySet(document, itemConstructor);
    }

    private Link = this.rdfDoc.Link(this.subj, this.predicate);

    public get Items(): ReadonlyArray<TEntity> {
        return [
            ...super.Items,
            // ...this.docSet.Items
        ];
    }


    public Add(id = undefined) {
        const subject = this.Link.add();
        const result = new this.itemConstructor(subject, this.rdfDoc);
        this.items.set(result.Id, result);
        // const info = Metadata.Entities.get(this.itemConstructor);
        // this.subj.addValue(info.TypeReference, "ref", result.Id);
        return result;
    }

    public Remove(entity: TEntity){
        this.items.delete(entity.Id);
        this.Link.remove(entity.Subject) ;
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
