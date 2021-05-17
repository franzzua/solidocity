import {document, entityField, entitySet} from "../helpers/decorators";
import {acl, foaf} from "rdf-namespaces";
import {BaseDocument} from "../base.document";
import {BareTripleDocument, createDocument, TripleDocument} from "tripledoc";
import {EntitySet} from "../entity-set";
import {Reference} from "../../contracts";
import {AclAuthorization} from "./aclAuthorization";
import {RdfDocument} from "../../rdf/RdfDocument";

@document(acl.Authorization)
export class AclDocument extends BaseDocument{

    constructor(baseURI: Reference, private ownerURI: Reference) {
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
        // await this.rdfDoc.CreateDocument();
        // await this.Init();
        // await this.InitRules(this.rdfDoc, owner, rights);
    }

    /** @internal **/
    protected async InitRules(doc: RdfDocument, owner: Reference, rights: Reference[]){
        const myAuth = this.Rules.Add(`${doc.URI}#owner`);
        myAuth.AccessTo = this.ownerURI;
        myAuth.Agents = [            owner        ]
        myAuth.Modes = [acl.Read, acl.Write, acl.Control];
        myAuth.Save();
        const otherAuth = this.Rules.Add(`${doc.URI}#other`);
        otherAuth.AccessTo = this.ownerURI;
        otherAuth.Default = this.ownerURI;
        otherAuth.AgentClass = foaf.Agent;
        otherAuth.Modes = rights;
        otherAuth.Save();
        await this.Save();
    }

    @entitySet(AclAuthorization)
    public Rules: EntitySet<AclAuthorization>;

}


