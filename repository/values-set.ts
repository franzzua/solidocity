import {addSubjectValue, getSubjectValues, IFieldInfo, removeSubjectValue} from "./metadata";
import {Permutation} from "../core/permutation";
import {TripleSubject} from "tripledoc";

export class ValuesSet<T extends string | Date | number> {

    private values: T[];
    /** @internal **/
    constructor(private subject: TripleSubject, private info: IFieldInfo){
        this.values = getSubjectValues(subject, info) as T[];
        const ordering = subject.getString(`${info.predicate}-order`);
        if (ordering != null){
            this.permutation = Permutation.Parse(ordering);
        }
    }

    //private values = getSubjectValues(this.subject, this.info);
    private permutation: Permutation = Permutation.Empty;// = this.subject.getString(`${this.info.predicate}-order`);

    public get Items(): ReadonlyArray<T>{
        return this.permutation.Invoke(this.values);
    }
    public set Items(items: ReadonlyArray<T>){
        const added = items.filter(x => !this.values.includes(x));
        const deleted = this.values.filter(x => !items.includes(x));
        for (let x of deleted){
            this.values.splice(this.values.indexOf(x), 1);
            removeSubjectValue(this.subject, this.info, x);
        }
        for (let x of added){
            this.values.push(x);
            addSubjectValue(this.subject, this.info, x);
        }
        this.permutation = Permutation.Diff(this.values, items);
    }

    public Push(...values: T[]) {

    }

    public Reorder(oldIndex: number, newIndex: number) {

    }
}
