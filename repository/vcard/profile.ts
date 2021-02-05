import {Document} from "../document";
import {acl, schema} from "rdf-namespaces";
import {document, entitySet} from "../decorators";
import {EntitySet} from "../entity-set";
import {Person} from "./person";
import {Card} from "./card";
import {TrustedApp} from "./trustedApp";



@document(schema.ProfilePage)
export class Profile extends Document {

    @entitySet(Card)
    public Card: Card;

    @entitySet(Person)
    public Me: Person;

    @entitySet(TrustedApp, {isArray: true})
    public TrustedApps: EntitySet<TrustedApp>;
}
