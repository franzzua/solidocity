import {entity, field} from "../decorators";
import {Entity} from "../entity";
import {acl} from "rdf-namespaces";
import {Reference} from "../../contracts";


const acl2 = {
    ...acl,
    trustedApp: 'http://www.w3.org/ns/auth/acl#trustedApp',
};


@entity(acl2.trustedApp)
export class TrustedApp extends Entity {

    @field(acl.mode, {type: "ref", isArray: true})
    public Modes: Reference[];

    @field(acl.origin, {type: "ref"})
    public Origin: Reference;
}
