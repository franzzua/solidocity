import {IFieldInfo} from "./helpers/metadata";
import {Permutation} from "../core/permutation";
import {Reference} from "../contracts";
import {RdfSubject, RdfValueType, RdfValueTypeName} from "../rdf/RdfSubject";

export class ValuesSet<T extends RdfValueType> {

    private values: T[];
    private IsRemoved: boolean;



    constructor(private subject: RdfSubject, private predicate: Reference, private type: RdfValueTypeName){
        this.Load();
    }

    protected Load(){
        // const subject = this.document.doc.getSubject(this.Id);
        this.values = this.subject.getValues(this.predicate, this.type) as T[];
        const ordering = this.subject.getValue(`${this.predicate}-order`, "string");
        if (ordering != null){
            this.permutation = Permutation.Parse(ordering);
        }
        this.Items = this.permutation.Invoke(this.values);
    }

    //private values = getSubjectValues(this.subject, this.info);
    private permutation: Permutation = Permutation.Empty;// = this.subject.getString(`${this.info.predicate}-order`);

    public Items: ReadonlyArray<T>;

    public Save(){
        if (this.IsRemoved){
            this.subject.removeAllValues(`${this.predicate}-order`);
            this.subject.removeAllValues(this.predicate);
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
        this.subject.setValue(`${this.predicate}-order`, "string",this.permutation.toString());
        for (let x of deleted){
            this.subject.removeValue(this.predicate, this.type, x);
        }
        for (let x of added){
            this.subject.addValue(this.predicate, this.type, x);
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
