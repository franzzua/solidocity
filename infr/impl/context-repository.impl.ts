import {schema} from 'rdf-namespaces';
import {Inject, Injectable} from "@hypertype/core";
import {entity, field, POD, SolidFileService, SolidRepository} from "@solid";
import {ContextRepository} from "@infr";
import {Reference} from "tripledoc";
import {Entity} from "../../solid/repository/entity";
import {ValuesSet} from "../../solid/repository/values-set";

@Injectable()
export class ContextRepositoryImpl extends SolidRepository<Context> implements ContextRepository {

    constructor(@Inject(POD) pod: Reference, fc: SolidFileService) {
        super(fc, pod, Context, '/private/contexts');
    }

    public async GetContexts(): Promise<any> {
        return undefined;
    }

    public async Save(): Promise<any> {
        return undefined;
    }
}

@entity('https://context.app/types#context')
export class Context extends Entity{

    @field(schema.Text)
    public Content = 'simple content';

    // @field(schema.children, {isArray: true, type: "ref"})
    // public Children: Context[] = [];

    @field(schema.parents, {isArray: true, type: "ref"})
    public Children?: ValuesSet<Reference>;

    @field(schema.referencesOrder)
    public Ordering?: string;
}

