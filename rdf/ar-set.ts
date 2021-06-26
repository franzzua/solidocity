import {Change} from "./change";
import {Triple} from "n3";

export class ArSet<T extends { equals(t: T): boolean; }> {
    constructor(private initial: T[]) {
    }

    private added = new ComparableSet<T>([], (x,y) => x.equals(y));
    private removed = new ComparableSet<T>([], (x,y) => x.equals(y));

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

    public merge(values: T[]){
        this.initial = values;
        for (let t of this.removed.value) {
            if (!this.initial.some(x => x.equals(t)))
                this.removed.remove(t);
        }
        for (let t of this.added.value) {
            if (this.initial.some(x => x.equals(t)))
                this.added.remove(t);
        }
    }

    public getChanges(): Change<T>{
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

class ComparableSet<T> {
    constructor(private initial: T[], private comparator: (t1, t2) => boolean) {

    }

    has(t: T): boolean {
        return this.initial.some(x => this.comparator(x, t));
    }

    find(t: T): T {
        return this.initial.find(x => this.comparator(x, t));
    }

    remove(t: T){

    }

    get value(): ReadonlyArray<T> {
        return this.initial;
    }

    public add(value: T): void {
        if (!this.has(value))
            this.initial.push(value);
    }

    public clear(): void {
        this.initial = [];
    }
}
