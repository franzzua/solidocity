import {BaseDocument} from "../base.document";
import {EntitySet} from "../entity-set";
import {Entity} from "../entity";
import {ValuesSet} from "../values-set";
import {Reference} from "../../contracts";
import {AccessMode} from "./acr.document";

export class PolicyDocument extends BaseDocument {

    protected async CreateDocument(): Promise<void> {
        return null;
    }

    public AccessPolicies: EntitySet<AccessPolicy>;
    public AccessRules: EntitySet<AccessRule>

}

export class AccessPolicy extends Entity {

    public readonly Allow: ValuesSet<AccessMode>;
    public readonly Deny: ValuesSet<AccessMode>;

    public AnyOf: EntitySet<AccessRule>;
    public SomeOf: EntitySet<AccessRule>;
    public NoneOf: EntitySet<AccessRule>;

}

export class AccessRule extends Entity{
    public Agents: ValuesSet<Reference>;
}


