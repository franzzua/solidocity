import {IComparable} from "./ar-set";

export class ComparableSet<T extends IComparable> {
    constructor(private initial: T[]) {

    }

    has(t: T): boolean {
        return this.initial.some(x => x.equals(t));
    }

    find(t: T): T {
        return this.initial.find(x => x.equals(t));
    }

    remove(t: T) {

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

    public diff(to: ComparableSet<T>) {
        const added = to.value.filter(x => !this.has(x));
        const removed = this.value.filter(x => !to.has(x));
        return {
            added, removed
        }
    }
}
