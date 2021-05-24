import {BaseDocument} from "../base.document";
import {Entity} from "../entity";
import {EntitySet} from "../entity-set";
import {Reference} from "../../contracts";
import {AccessPolicy} from "./policy.document";

export class AcrDocument extends BaseDocument{
    protected async CreateDocument(): Promise<void> {
        return null;
    }

    public AccessControlSet: EntitySet<AccessControlStatement>;
}

export class AccessControlStatement extends Entity {

    public GetPolicies(applying: AccessPolicyApplying): ReadonlyArray<Reference>{
        const applyingPredicate = this.getApplyingType(applying);
        return this.Subject.getValues(applyingPredicate, "ref");
    }

    public ApplyPolicy(policy: AccessPolicy, applying: AccessPolicyApplying){
        const applyingPredicate = this.getApplyingType(applying);
        this.Subject.addValue(applyingPredicate,"ref", policy.Id);
    }

    public RemovePolicy(policy: AccessPolicy, applying: AccessPolicyApplying){
        const applyingPredicate = this.getApplyingType(applying);
        this.Subject.removeValue(applyingPredicate, "ref", policy.Id);
    }

    protected  getApplyingType(applying: AccessPolicyApplying){
        return `${acp}#${applying.IsAccess ? 'access' : 'apply'}${applying.IsMembers ? 'Members' : ''}${applying.Protection}`;
    }

}

export type AccessPolicyApplying = {
    IsAccess: boolean;
    IsMembers: boolean;
    Protection: '' | 'Locked' | 'Protected';
}

const acp = 'http://www.w3.org/ns/solid/acp';
export enum ApplyingType {
    Apply = `http://www.w3.org/ns/solid/acp#apply`,
    Members = `http://www.w3.org/ns/solid/acp#apply`,
    Protected = `http://www.w3.org/ns/solid/acp#applyProtected`,
}

export enum AccessMode {
    Read = `http://www.w3.org/ns/solid/acp#Read`,
    Write = `http://www.w3.org/ns/solid/acp#Write`,
    Append = `http://www.w3.org/ns/solid/acp#Append`
}
