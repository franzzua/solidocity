import {getSubjectValues, IFieldInfo} from "./metadata";
import {Permutation} from "../core/permutation";
import {TripleSubject} from "tripledoc";

export class ValuesSet<T extends string | Date | number> {

    constructor(private values: T[] = []) {
    }

    public Load(subject: TripleSubject, info: IFieldInfo){
        this.values = getSubjectValues(subject, info) as T[];
        const ordering = subject.getString(`${info.predicate}-order`);
        if (ordering != null){
            this.permutation = Permutation.Parse(ordering);
        }
    }

    public Save(subject: TripleSubject, info: IFieldInfo){

    }
    //private values = getSubjectValues(this.subject, this.info);
    private permutation: Permutation = Permutation.Empty;// = this.subject.getString(`${this.info.predicate}-order`);

    public get Items(): ReadonlyArray<T>{
        return this.permutation.Invoke(this.values);
    }
    public set Items(items: ReadonlyArray<T>){
        this.permutation = Permutation.Diff(this.values, items);
    }

    public Push(...values: T[]) {

    }

    public Reorder(oldIndex: number, newIndex: number) {

    }
}
