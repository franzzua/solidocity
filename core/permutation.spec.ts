import {Permutation} from "./permutation";

describe('permutation', () => {
    it('should apply', () => {
        const p1 = new Permutation([1, 0, 2]);
        const p2 = new Permutation([2, 1, 0]);

        const result = p1.Apply(p2).ToArray();
        expect(result).toEqual([2,0, 1]);
    });
    it('should apply 2', () => {
        const p1 = new Permutation([1, 0, 2]);
        const p2 = new Permutation([1, 0, 2]);

        const result = p1.Apply(p2).ToArray();
        expect(result).toEqual([0,1,2]);
    });
    it('should be same', () => {
        const arr1 = [2,3,5,6,7,4];
        const arr2 = [5,3,6,4,7,2];
        const permutation = Permutation.Diff(arr1, arr2);
        const check = permutation.Invoke(arr1);
        expect(check).toEqual(arr2);
    });
});
