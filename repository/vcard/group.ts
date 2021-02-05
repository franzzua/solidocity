import {Entity} from "../entity";
import {ValuesSet} from "../values-set";
import {Reference} from "../../contracts";
import {entity, valuesSet} from "../decorators";
import {vcard} from "rdf-namespaces";

@entity(vcard.Group)
export class Group extends Entity {
    @valuesSet(vcard.hasMember, {type: "ref"})
    public Members: ValuesSet<Reference>;
}

