import {RdfObject, RdfValueType} from "./rdf-object";

export class RdfSet<T extends RdfValueType> extends RdfObject<T> {

    get(): T[] {
        return this.triples.map(value => this.toJS(value.object));
    }

    set(newItems: T[]) {
        const oldValues = this.get();
        if (!newItems || newItems.length == 0) {
            this.subject.replace(this.triples, []);
        } else if (oldValues.length == 0) {
            this.subject.replace([], newItems.map(this.toTriple));
        } else {
            const add = [...newItems].remove(this.get());
            const remove = this.triples.remove(newItems, (t, v) => this.toJS(t.object) === v);
            this.subject.replace(remove, add.map(this.toTriple));
        }
    }

    public add(newItem: T): void {
        this.subject.replace([], [
            this.toTriple(newItem)
        ]);

    }

    public remove(newItem: T): void {
        this.subject.replace(this.triples.filter(x => this.toJS(x.object) == newItem), []);
    }
}
