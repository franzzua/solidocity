import {Injectable} from "@hypertype/core";
import {ProfileRepository} from "@infr";
import {AuthAppService} from "@app";
import {schema, vcard, rdfs, solid, space, rdf, dc} from 'rdf-namespaces';
import {field, ORM} from "./orm";
import {fetchDocument, createDocument} from "tripledoc";
import {SolidFileService} from "@solid";


@Injectable()
export class NodeProfileRepository extends ProfileRepository {
    constructor(private authService: AuthAppService,
                private fs: SolidFileService) {
        super();
    }

    public async GetProfile(): Promise<Profile> {
        const session = await this.authService.GetSession();
        const profile = await ORM.ReadOne(Profile, 'https://fransua.inrupt.net/profile/card#me');
        await (profile.Name = "Andrey Khamidulin");
        return profile as any;
    }

    public async RegisterType(constructor) {
        const {webId} = await this.authService.GetSession();
        const profileDocument = await fetchDocument(webId);
        const profile = profileDocument.getSubject(webId);
        const publicTypeIndexRef = profile.getRef(solid.publicTypeIndex);
        if (typeof publicTypeIndexRef !== "string") {
            return null;
        }
        const publicTypeIndexDocument = await fetchDocument(publicTypeIndexRef);
        // 2. If there is a type registration for TextDigitalDocuments, return the instance predicate.
        const existingTypeRegistration = publicTypeIndexDocument.findSubject(
            solid.forClass,
            schema.TextDigitalDocument
        );
        if (existingTypeRegistration) {
            return existingTypeRegistration.getRef(solid.instance);
        } else {
            // 3. If no type registration exists, create a new Document in the storage root, and register it
            //    for TextDigitalDocuments.
            const storageRef = profile.getRef(space.storage);
            const path = `${storageRef}/private/${constructor.name}.ttl`;
            if (await this.fs.itemExists(path)){
                await this.fs.deleteFile(path);
            }
            const document = createDocument(path);
            const newDocument = await document.save();

            const newTypeRegistration = publicTypeIndexDocument.addSubject();
            newTypeRegistration.addRef(rdf.type, solid.TypeRegistration);
            newTypeRegistration.addRef(solid.instance, newDocument.asRef());
            newTypeRegistration.addRef(solid.forClass, schema.Volcano);
            publicTypeIndexDocument.save([newTypeRegistration]);

            return newDocument.asRef();
        }
    }
}

export class Profile {
    @field(vcard.fn)
    public Name;
    @field('http://www.w3.org/2006/vcard/ns#organization-name')
    public Organization;
    @field(vcard.role)
    public Role;
}

