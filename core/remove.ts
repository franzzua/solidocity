export {};
declare global {
    interface Array<T> {
        remove(items: T[], comparer?: (a: T, b: T) => boolean): void;
        removeIf(checker: (x: T) => boolean): void;
    }
}

Array.prototype.remove = function <T>(items: T[], comparer: (a: T, b: T) => boolean = (a, b) => a === b) {
    let length = this.length;
    for (let index = 0; index < length; ){
        const current = this[index];
        if (!items.some(x => comparer(x, current))) {
            index++;
            continue;
        }
        this[index] = this[length - 1];
        length--;
    }
    this.length = length;
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