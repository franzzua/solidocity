import {Document} from "./document";
import {foaf, vcard, ldp, schema, acl} from "rdf-namespaces";
import {Entity} from "./entity";
import {entity, entityField, field, document} from "./decorators";
import {Reference} from "../contracts";
import {EntitySet} from "./entity-set";

const acl2 = {
    ...acl,
    trustedApp: 'http://www.w3.org/ns/auth/acl#trustedApp',
};

@entity(foaf.PersonalProfileDocument)
export class Card extends Entity {
    @field(foaf.maker, {type: "ref"})
    public Maker: Reference;

    @field(foaf.primaryTopic, {type: "ref"})
    public PrimaryTopic: Reference;
}


@entity(acl2.trustedApp)
export class TrustedApp extends Entity{

    @field(acl.mode, {type: "ref", isArray: true})
    public Modes: Reference[];

    @field(acl.origin, {type:"ref"})
    public Origin: Reference;
}

@entity(schema.Person)
export class Person extends Entity{
    @field(vcard.fn)
    public FullName: string;

    @field('http://www.w3.org/2006/vcard/ns#organization-name')
    public Organization: string;

    @field(vcard.role)
    public Role: string;

    @field(ldp.inbox, {type: "ref"})
    public Inbox: Reference;

    @entityField(TrustedApp, {isArray: true})
    public TrustedApps: EntitySet<TrustedApp>;
}


@document(schema.ProfilePage)
export class Profile extends Document {

    @entityField(Card)
    public Card: Card;

    @entityField(Person)
    public Me: Person;

    @entityField(TrustedApp, {isArray: true})
    public TrustedApps: EntitySet<TrustedApp>;
}
