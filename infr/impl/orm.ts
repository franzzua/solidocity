import {Variable, Fetcher, graph, NamedNode, st, Statement, sym, UpdateManager} from 'rdflib';
import {ldp, rdf} from "rdf-namespaces";
import {fetch} from 'solid-auth-cli'
import { utc } from '@hypertype/core';

const store = graph();
const fetcher = new Fetcher(store, {fetch});
const updater = new UpdateManager(store);

export interface IFieldRegistration {
    NamedNode: NamedNode;
    Field: string;
}

export class ORM {
    private static Registrations = new Map<Function, IFieldRegistration[]>();

    public static RegisterField(constructor, name, key) {
        if (!this.Registrations.has(constructor))
            this.Registrations.set(constructor, []);
        this.Registrations.get(constructor).push({
            NamedNode: new NamedNode(name),
            Field: key
        });
    }

    public static async Create<T>(instance: T, path: string): Promise<void>{
        await fetcher.load(path);
        const fields = this.Registrations.get(instance.constructor);
        const id = `${path}#${+utc()}`;
        const statements = fields.map(x => st(sym(id), x.NamedNode, instance[x.Field], sym(path).doc()));
        await store.add(statements);
        await updater.update([], store.statementsMatching(sym(id), null, null));
    }

    public static async ReadOne<T extends new (...args: any) => any>(constructor: T, path: string): Promise<InstanceType<T>> {
        await fetcher.load(path);
        const subject = new NamedNode(path);
        const doc = subject.doc();
        const result = new constructor();
        const fields = ORM.Registrations.get(constructor);
        if (!fields)
            return result;
        for (let field of fields) {
            const statement = st(subject, field.NamedNode, null, doc);
            const object = await store.any(subject, field.NamedNode, null, doc);
            Object.defineProperty(result, field.Field, {
                get() {
                    return object.value;
                },
                async set(value) {
                    await updater.update(
                        await store.statementsMatching(subject, field.NamedNode, null, doc),
                        [st(subject, field.NamedNode, value, doc)]
                    );
                    object.value = value;
                },
                enumerable: true
            });
        }
        return result;
    }
}

export class CRUD {

}

export const field: (name) => PropertyDecorator = (name) => (target, key) => {
    ORM.RegisterField(target.constructor, name, key);
};
