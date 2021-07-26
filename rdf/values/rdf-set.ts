import "../../core/remove";
import {RdfObject, RdfValueType} from "./rdf-object";
import {Triple} from "n3";
import {applyChange, Change} from "../change";
import {ComparableSet} from "../comparable-set";

export class RdfSet<T extends RdfValueType> extends RdfObject<T> {

    public value: ReadonlyArray<T> = this.triples.map(value => this.toJS(value.object));

    get(): T[] {
        return [...this.value];
    }

    set(newItems: ReadonlyArray<T>) {
        if (!newItems || newItems.length == 0) {
            this.change.remove = this.triples;
            this.value = [];
        } else if (this.value.length == 0) {
            this.change.add = newItems.map(x => this.toTriple(x));
            this.value = newItems;
        } else {
            const {add, remove} = diffArrays(this.triples, newItems.map(x => this.toTriple(x)));
            this.change.add = [
                ...this.change.add,
                ...add
            ];
            this.change.remove = [
                ...this.change.remove,
                ...remove
            ];
            this.value = newItems;
        }
    }

    public add(newItem: T): void {
        this.change.add = [...this.change.add, this.toTriple(newItem)];
        this.value = [...this.value, newItem];
    }

    public remove(newItem: T): void {
        this.change.remove = [...this.change.remove, this.toTriple(newItem)];
        this.value = this.value.filter(x => x !== newItem);
    }

    public merge(triples: Array<Triple>): void {
        this.triples = triples;
        this.value = applyChange(this.change, triples).map(x => this.toJS(x.object));
    }
}



export function contains<T extends {
    equals(x: T): boolean
}>(arr: ReadonlyArray<T>){
    return x => arr.some(y => y.equals(x));
}

export function diffArrays<T extends {
    equals(x: T): boolean
}>(from: ReadonlyArray<T>, to: ReadonlyArray<T>): Change<T>{

    const add = to.filter(x => !contains(from)(x));
    const remove = from.filter(x => !contains(to)(x));
    return {
        add, remove
    };
}
