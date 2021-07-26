export {};
declare global {
    interface ReadonlyArray<T> {
        groupBy<K>(selector: (t: T) => K): Map<K, Array<T>>;
    }
    interface Array<T> {
        groupBy<K>(selector: (t: T) => K): Map<K, Array<T>>;
    }
}
Array.prototype.groupBy = function <T, K>(selector: (t: T) => K) {
    return this.reduce((result: Map<K, Array<T>>, item: T) => {
        const key = selector(item);
        if (result.has(key))
            result.get(key).push(item);
        else
            result.set(key, [item]);
        return result;
    }, new Map());
};
