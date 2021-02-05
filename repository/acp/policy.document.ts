import {BaseDocument} from "../base.document";
import {TripleDocument} from "tripledoc";
import {EntitySet} from "../entity-set";
import {Entity} from "../entity";
import {ValuesSet} from "../values-set";
import {Reference} from "../../contracts";
import {AccessMode} from "./acr.document";

export class PolicyDocument extends BaseDocument {

    protected async CreateDocument(): Promise<TripleDocument> {
        return null;
    }

    public AccessPolicies: EntitySet<AccessPolicy>;
    public AccessRules: EntitySet<AccessRule>

}

export class AccessPolicy extends Entity {

    public readonly Allow: ValuesSet<AccessMode>;
    public readonly Deny: ValuesSet<AccessMode>;

    public AnyOf: ValuesSet<Reference>;
    public SomeOf: ValuesSet<Reference>;
    public NoneOf: ValuesSet<Reference>;

}

export class AccessRule extends Entity{
    public Agents: ValuesSet<Reference>;
}


