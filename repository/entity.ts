import {ItemsDocument} from "./document";
import {
    IFieldInfo,
    Metadata
} from "./helpers/metadata";
import {ValuesSet} from "./values-set";
import {BaseDocument} from "./base.document";
import {rdf} from "rdf-namespaces";
import {FieldEntitySet} from "./entity-set";
import {Reference} from "../contracts";
import {RdfSubject} from "../rdf/RdfSubject";
import {RdfLink} from "../rdf/values/rdf-link";
import {Conflict} from "../rdf/values/rdf-object";
import {RdfDocument} from "../rdf/RdfDocument";

export class Entity {
    public Deleted: boolean;

    public get Id() {
        return this.Subject.URI
    }

    /** @internal **/
    constructor(
        /** @internal **/
        public Subject: RdfSubject,
        public Document: RdfDocument,
    ) {
        this.Load();
    }

    /** @internal **/
    // public get Subject () {
    //    return this.localSubject ?? this.Document.doc.getSubject(this.Id);
    // }

    public Load() {
        const fieldInfos = Metadata.Fields.get(this.constructor);
        const result = {} as EntityFields<this>;
        const conflicts = {} as EntityConflicts<this>
        for (const info of fieldInfos) {
            const rdfObject = this.getRdfObject(info);
            if (rdfObject.conflict){
                conflicts[info.field] = rdfObject.conflict;
                continue;
            }
            if (info.type == "object") {
                const link = rdfObject as RdfLink;
                const subjects = link.get();
                if (info.isArray) {
                    const set = new FieldEntitySet(this.Document, info.Constructor, this.Subject, info.predicate);
                    set.Load(subjects);
                    result[info.field] = set;
                } else {
                    const subject = subjects[0] ?? link.add()
                    result[info.field] = new info.Constructor(subject, this.Document);
                }
            } else {
                if (info.isArray && info.isOrdered) {
                    result[info.field] = new ValuesSet(this.Subject, info.predicate, info.type);
                } else if (info.isArray) {
                    result[info.field] = rdfObject.get();
                } else {
                    result[info.field] = rdfObject.get();
                }
            }
        }
        if (Object.keys(conflicts).length == 0){
            Object.assign(this, result);
        }else {
            const resolved = this.Merge(result, conflicts);
            Object.assign(this, resolved);
            for (let conflictsKey in conflicts) {
                conflicts[conflictsKey].resolve(resolved[conflictsKey]);
            }
        }
    }

    private getRdfObject(info: IFieldInfo) {
        if (info.type == "object") {
            return this.Document.Link(this.Subject, info.predicate);
        }
        if (info.isArray) {
            return this.Subject.Set(info.predicate, info.type);
        }
        return this.Subject.Scalar(info.predicate, info.type);
    }

    public Save() {
        const fieldInfos = Metadata.Fields.get(this.constructor);
        if (this.Deleted) {
            this.Subject.Remove()
            return;
        }
        for (const info of fieldInfos) {
            const key = info.field;
            const rdfObject = this.getRdfObject(info)
            if (info.type == "object") {
                const link = rdfObject as RdfLink;
                if (info.isArray) {
                    link.set((this[info.field] as FieldEntitySet<Entity>).Items.map(x => x.Subject));
                } else {
                    link.set([(this[info.field] as Entity).Subject]);
                }
                continue;
            }
            if (info.isArray && info.isOrdered) {
                (this[info.field] as ValuesSet<any>).Save();
            } else if (info.isArray) {
                rdfObject.set(this[key]);
            } else {
                rdfObject.set(this[key]);
            }
        }
        const currentType = Metadata.Entities.get(this.constructor).TypeReference;
        this.Subject.Scalar(rdf.type, "ref").set(currentType);
    }

    public Remove() {
        this.Deleted = true;
        this.Save();
    }

    /**
     * In conflict situation shold resolve
     * @param other remote changes without conflict
     * @param conflicts conflicted properties
     * @returns resolved right values
     */
    public Merge(other: EntityFields<this>, conflicts: EntityConflicts<this>): EntityFields<this> {
        return other;
    }

}

export type EntityFields<TEntity extends Entity> = Omit<TEntity, keyof Entity>;
export type EntityConflicts<TEntity extends Entity> = {
    [key in keyof EntityFields<TEntity>]: Conflict<TEntity[key]>
}

export type ConstructorOf<T, Params extends Array<any>> = {
    new(...args: Params): T;
}

export type EntityConstructor<TEntity> = ConstructorOf<TEntity, ConstructorParameters<typeof Entity>>;
