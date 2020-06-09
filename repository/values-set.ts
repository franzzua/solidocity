import {IFieldInfo} from "./metadata";
import {Permutation} from "../core/permutation";
import {TripleSubject} from "tripledoc";
import {Reference} from "../contracts";
import { BaseDocument } from "./base.document";
import {addSubjectValue, getSubjectValues, removeSubjectValue} from "./subject.ext";

export class ValuesSet<T extends string | Date | number> {

    private values: T[];
    private IsRemoved: boolean;

    constructor(private document: BaseDocument, private Id: Reference, private info: IFieldInfo){
        this.Load();
    }

    protected Load(){
        const subject = this.document.doc.getSubject(this.Id);
        this.values = getSubjectValues(subject, this.info) as T[];
        const ordering = subject.getString(`${this.info.predicate}-order`);
        if (ordering != null){
            this.permutation = Permutation.Parse(ordering);
        }
        this.Items = this.permutation.Invoke(this.values);;
    }

    //private values = getSubjectValues(this.subject, this.info);
    private permutation: Permutation = Permutation.Empty;// = this.subject.getString(`${this.info.predicate}-order`);

    public Items: ReadonlyArray<T>;

    public Save(){
        if (this.IsRemoved){
            const subject = this.document.doc.getSubject(this.Id);
            subject.removeAll(`${this.info.predicate}-order`);
            return;
        }
        const added = this.Items.filter(x => !this.values.includes(x));
        const deleted = this.values.filter(x => !this.Items.includes(x));
        for (let x of deleted){
            this.values.splice(this.values.indexOf(x), 1);
        }
        for (let x of added){
            this.values.push(x);
        }
        this.values.sort();
        this.permutation = Permutation.Diff(this.values, this.Items);
        const subject = this.document.doc.getSubject(this.Id);
        subject.removeAll(`${this.info.predicate}-order`);
        subject.setString(`${this.info.predicate}-order`, this.permutation.toString());
        for (let x of deleted){
            removeSubjectValue(subject, this.info, x);
        }
        for (let x of added){
            addSubjectValue(subject, this.info, x);
        }
    }

    public Push(...values: T[]) {
        const items = [...this.Items];
        items.push(...values);
        this.Items = items;
    }

    public Reorder(oldIndex: number, newIndex: number) {
        const items = [...this.Items];
        const child = items.splice(oldIndex, 1)[0];
        items.splice(newIndex, 0, child);
        this.Items  = items;
    }

    public Insert(child: T, index: any) {
        if (this.values.includes(child))
            return;
        const oldItems = [...this.Items];
        oldItems.splice(index, 0, child);
        this.Items = oldItems;
    }

    public Remove(index: any) {
        const items = [...this.Items];
        items.splice(index, 1);
        this.Items = items;
    }

    /** @internal **/
    Delete() {
        this.IsRemoved = true;
    }
}
