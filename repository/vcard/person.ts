import {entity, entitySet, field} from "../decorators";
import {ldp, schema, space, vcard} from "rdf-namespaces";
import {Entity} from "../entity";
import {Reference} from "../../contracts";
import {EntitySet} from "../entity-set";
import {TrustedApp} from "./trustedApp";

@entity(schema.Person)
export class Person extends Entity {
    @field(vcard.fn)
    public FullName: string;

    @field('http://www.w3.org/2006/vcard/ns#organization-name')
    public Organization: string;

    @field(vcard.role)
    public Role: string;

    @field(ldp.inbox, {type: "ref"})
    public Inbox: Reference;

    @field(space.storage, {type: "ref"})
    public Storage: Reference;

    @entitySet(TrustedApp, {isArray: true})
    public TrustedApps: EntitySet<TrustedApp>;
}
