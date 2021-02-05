import {entity, field} from "../decorators";
import {vcard} from "rdf-namespaces";
import {Entity} from "../entity";

@entity(vcard.Address)
export class Address extends Entity {
    @field(vcard.hasCountryName)
    public CountryName: string;

    @field(vcard.hasLocality)
    public Locality: string;

    @field(vcard.hasPostalCode)
    public PostalCode: string;

    @field(vcard.hasRegion)
    public Region: string;

    @field(vcard.hasStreetAddress)
    public StreetAddress: string;
}
