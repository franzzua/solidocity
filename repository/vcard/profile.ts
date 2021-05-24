import {Document} from "../document";
import {acl, schema} from "rdf-namespaces";
import {document, entity, entityField, entitySet} from "../helpers/decorators";
import {EntitySet} from "../entity-set";
import {Person} from "./person";
import {Card} from "./card";
import {TrustedApp} from "./trustedApp";

@document(schema.ProfilePage)
export class Profile extends Document {

    @entityField(Card, '')
    public Card: Card;

    @entityField(Person, '#me')
    public Me: Person;

}
