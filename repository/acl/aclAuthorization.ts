import {entity, field} from "../decorators";
import {acl} from "rdf-namespaces";
import {Entity} from "../entity";
import {Reference} from "../../contracts";

@entity(acl.Authorization)
export class AclAuthorization extends Entity {

    @field(acl.accessTo, {type: "ref"})
    public AccessTo: Reference;

    @field(acl.agent, {type: "ref", isArray: true})
    public Agents: Reference[];

    @field(acl.default__workaround, {type: "ref"})
    public Default: Reference;

    @field(acl.mode, {type: "ref", isArray: true})
    public Modes: Reference[];

    @field(acl.agentClass, {type: "ref"})
    public AgentClass: Reference;
}
