import {IComparable} from "./ar-set";

export type Change<T> = { add: ReadonlyArray<T>; remove: ReadonlyArray<T>; };

export function mergeChanges<T>(changes: ReadonlyArray<Change<T>>) {
    return {
        add: changes.flatMap(x => x.add),
        remove: changes.flatMap(x => x.remove)
    };
}

export function applyChange<T extends IComparable>(change: Change<T>, value: ReadonlyArray<T>) {
    return [
        ...value.filter(x => !change.remove.some(y => y.equals(x))),
        ...change.add
    ];
}
