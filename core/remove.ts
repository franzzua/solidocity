export {};
declare global {
    interface Array<T> {
        remove<U = T>(items: ReadonlyArray<U>, comparer?: (a: T, b: U) => boolean): T[];
        removeIf(checker: (x: T) => boolean): void;
    }
}

Array.prototype.remove = function <T,U = T>(items: ReadonlyArray<U>, comparer: (a: T, b: U) => boolean = (a, b) => a === b as unknown as T): T[] {
    let length = this.length;
    for (let index = 0; index < length; ){
        const current = this[index];
        if (!items.some(x => comparer(current, x))) {
            index++;
            continue;
        }
        this[index] = this[length - 1];
        length--;
    }
    const result = this.slice(length);
    this.length = length;
    return result;
};

Array.prototype.removeIf = function <T>(checker: (a: T) => boolean) {
    let length = this.length;
    for (let index = 0; index < length; ){
        const current = this[index];
        if (!checker(current)) {
            index++;
            continue;
        }
        this[index] = this[length - 1];
        length--;
    }
    this.length = length;
};
