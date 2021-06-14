import {IFieldInfo} from "./helpers/metadata";
import {Permutation} from "../core/permutation";
import {Reference} from "../contracts";
import {RdfSubject} from "../rdf/RdfSubject";
import {RdfValueType, RdfValueTypeName} from "../rdf/values/rdf-object";

export class ValuesSet<T extends RdfValueType> {

    private values: T[];
    private IsRemoved: boolean;


    constructor(private subject: RdfSubject, private predicate: Reference, private type: RdfValueTypeName) {
        this.Load();
    }

    protected Load() {
        // const subject = this.document.doc.getSubject(this.Id);
        this.values = this.subject.Set(this.predicate, this.type).get() as T[];
        const ordering = this.subject.Scalar<string>(`${this.predicate}-order`, "string").get();
        if (ordering != null) {
            this.permutation = Permutation.Parse(ordering);
        }
        this.Items = this.permutation.Invoke(this.values);
    }

    //private values = getSubjectValues(this.subject, this.info);
    private permutation: Permutation = Permutation.Empty;// = this.subject.getString(`${this.info.predicate}-order`);

    public Items: ReadonlyArray<T>;

    public Save() {
        if (this.IsRemoved) {
            this.subject.Scalar<string>(`${this.predicate}-order`, "string").set(null);
            this.subject.Set(this.predicate, this.type).set([]);
            return;
        }
        const added = this.Items.filter(x => !this.values.includes(x));
        const deleted = this.values.filter(x => !this.Items.includes(x));
        for (let x of deleted) {
            this.values.splice(this.values.indexOf(x), 1);
        }
        for (let x of added) {
            this.values.push(x);
        }
        this.values.sort();
        this.permutation = Permutation.Diff(this.values, this.Items);
        this.subject.Scalar(`${this.predicate}-order`, "string").set(this.permutation.toString());
        this.subject.Set(this.predicate, this.type).set(this.values);
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
        this.Items = items;
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
