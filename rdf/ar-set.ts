import {Change} from "./change";
import {ComparableSet} from "./comparable-set";
import {diffArrays} from "./values/rdf-set";

export interface IComparable {
    equals(t: this): boolean
}

export class ArSet<T extends IComparable> {
    constructor(private initial: T[]) {
    }

    private added = new ComparableSet<T>([]);
    private removed = new ComparableSet<T>([]);

    public get Values(): T[] {
        return [
            ...this.initial.filter(x => !this.removed.has(x)),
            ...this.added.value
        ]
    }

    public add(...values: ReadonlyArray<T>) {
        for (let value of values) {
            if (this.removed.has(value))
                this.removed.remove(value);
            else
                this.added.add(value);
        }
    }

    public remove(...values: ReadonlyArray<T>) {
        for (let value of values) {
            if (this.added.has(value))
                this.added.remove(value);
            else
                this.removed.add(value);
        }
    }

    public contains(x: T): boolean {
        return this.added.has(x)
            && !this.removed.has(x);
    }

    public merge(values: T[]) {
        const {add, remove} = diffArrays(this.initial, values);
        const removed = remove.filter(x => !this.removed.has(x));
        this.initial = values;
        this.removed = new ComparableSet<T>([
            ...add,
            ...this.removed.value,
            ...removed
        ]);
        this.added = new ComparableSet<T>([
            ...removed,
            ...this.added.value,
            ...add.filter(x => !this.added.has(x))
        ]);
        // for (let t of this.removed.value) {
        //     if (!this.initial.some(x => x.equals(t)))
        //         this.removed.remove(t);
        // }
        // for (let t of this.added.value) {
        //     if (this.initial.some(x => x.equals(t)))
        //         this.added.remove(t);
        // }
    }

    public getChanges(): Change<T> {
        return {
            add: this.added.value,
            remove: this.removed.value
        }
    }

    public saveChanges(): void {
        this.initial = this.Values;
        this.removed.clear();
        this.added.clear();
    }
}

