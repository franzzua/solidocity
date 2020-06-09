import {Entity, EntityConstructor} from "./entity";
import {BaseDocument} from "./base.document";
import {TripleSubject, TripleDocument} from "tripledoc";
import {Metadata} from "./metadata";
import { Reference } from "../contracts";

export class EntitySet<TEntity extends Entity> {
    constructor(protected document: BaseDocument,
                protected itemConstructor: EntityConstructor<TEntity>,
                protected items: Map<Reference,TEntity> = new Map()) {
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
        return newItem;
    }

    /** @internal */
    Load(subjects: TripleSubject[]) {
        //console.log('load subjects', subjects.length);
        this.items = new Map(subjects.map(x => new this.itemConstructor(x.asRef(), this.document))
            .map(x => [x.Id, x]));
    }

    public Save(){

    }

    public get(id: Reference): TEntity{
        return this.items.get(id);
    }
}

/** @internal **/
export class FieldEntitySet<TEntity extends Entity> extends EntitySet<TEntity>{
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


    public Add(id = undefined){
        const result = super.Add(id);
        const info = Metadata.Entities.get(this.itemConstructor);
        this.subj.addRef(info.TypeReference, result.Id);
        return  result;
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