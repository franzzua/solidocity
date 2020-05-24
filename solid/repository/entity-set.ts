import {Entity, EntityConstructor} from "./entity";
import {BaseDocument} from "./base.document";
import {TripleSubject} from "tripledoc";

export class EntitySet<TEntity extends Entity> {
    constructor(private document: BaseDocument,
                private itemConstructor: EntityConstructor<TEntity>,
                private items: TEntity[] = []) {
    }

    public get Items(): ReadonlyArray<TEntity> {
        return this.items;
    }

    public async Add() {
        const subject = this.document.doc.addSubject();
        const newItem = new this.itemConstructor(subject, this.document);
        this.items.push(newItem);
        return newItem;
    }

    Load(subjects: TripleSubject[]) {
        this.items = subjects.map(x => new this.itemConstructor(x, this.document));
    }
}
