import {document, entityField, entitySet} from "../helpers/decorators";
import {acl, foaf} from "rdf-namespaces";
import {BaseDocument} from "../base.document";
import {EntitySet} from "../entity-set";
import {Reference} from "../../contracts";
import {AclAuthorization} from "./aclAuthorization";
import {RdfDocument} from "../../rdf/RdfDocument";
import {authFetch} from "../../impl/auth";

@document(acl.Authorization)
export class AclDocument extends BaseDocument{

    constructor(baseURI: Reference, private ownerURI: Reference) {
        super(baseURI);
    }


    /** @internal **/
    protected async CreateDocument(): Promise<void> {
        return null;
    }

    public async Init() {
        await super.Init();
    }

    async InitACL(owner: Reference) {
        await authFetch(this.URI, {
            method: 'PUT',
            body: `
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
<#owner>
    a acl:Authorization;
    acl:agent ${owner};
    acl:accessTo <${this.ownerURI}>;
    acl:default <${this.ownerURI}>;
    acl:mode
        acl:Read, acl:Write, acl:Control.
`
        });
        // await this.rdfDoc.CreateDocument();
        await this.Init();
        // await this.InitRules(this.rdfDoc, owner, rights);
    }

    /** @internal **/
    protected async InitRules(doc: BaseDocument, owner: Reference, rights: Reference[]){
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


