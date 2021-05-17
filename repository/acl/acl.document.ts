import {document, entitySet} from "../helpers/decorators";
import {acl, foaf} from "rdf-namespaces";
import {BaseDocument} from "../base.document";
import {BareTripleDocument, createDocument, TripleDocument} from "tripledoc";
import {EntitySet} from "../entity-set";
import {Reference} from "../../contracts";
import {AclAuthorization} from "./aclAuthorization";
import {RdfDocument} from "../../rdf/RdfDocument";

@document(acl.Authorization)
export class AclDocument extends BaseDocument{

    constructor(baseURI: Reference, private owner: BaseDocument) {
        super(baseURI, false);
    }


    /** @internal **/
    protected async CreateDocument(): Promise<TripleDocument> {
        return null;
    }

    public async Init() {
        await super.Init();
    }

    async InitACL(owner: Reference, ...rights: Reference[]) {
        await this.rdfDoc.CreateDocument();
        await this.InitRules(this.rdfDoc, owner, rights);
        await this.Init();
    }

    /** @internal **/
    protected async InitRules(doc: RdfDocument, owner: Reference, rights: Reference[]){
        const mySubject = doc.addSubject(`${doc.URI}#owner`);
        const myAuth = new AclAuthorization(mySubject, this);
        myAuth.AccessTo = this.owner.URI;
        myAuth.Agents = [            owner        ]
        myAuth.Modes = [acl.Read, acl.Write, acl.Control];
        myAuth.Save();
        const otherSubject = doc.addSubject(`${doc.URI}#other`);
        const otherAuth = new AclAuthorization(otherSubject, this);
        otherAuth.AccessTo = this.owner.URI;
        otherAuth.Default = this.owner.URI;
        otherAuth.AgentClass = foaf.Agent;
        otherAuth.Modes = rights;
        otherAuth.Save();

    }

    @entitySet(AclAuthorization)
    public Rules: EntitySet<AclAuthorization>;

}


