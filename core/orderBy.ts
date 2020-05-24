export {};
declare global {
    interface Array<T> {
        orderBy(selector: (t: T) => (string | number), descending?: any): Array<T>;
    }
}

Array.prototype.orderBy = function (selector = x => x) {
    return [...this].sort((a, b) => (selector(a) > selector(b)) ? 1 : -1);
};