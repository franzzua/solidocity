import {entity, field} from "../decorators";
import {foaf} from "rdf-namespaces";
import {Entity} from "../entity";
import {Reference} from "../../contracts";

@entity(foaf.PersonalProfileDocument)
export class Card extends Entity {
    @field(foaf.maker, {type: "ref"})
    public Maker: Reference;

    @field(foaf.primaryTopic, {type: "ref"})
    public PrimaryTopic: Reference;
}
