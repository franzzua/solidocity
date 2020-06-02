import {entity, document, entitySet, field} from "./decorators";
import {acl, foaf} from "rdf-namespaces";
import {BaseDocument} from "./base.document";
import {createDocument, TripleDocument, TripleSubject} from "tripledoc";
import {EntitySet} from "./entity-set";
import {Entity} from "./entity";
import {Reference} from "../contracts";
import {BareTripleDocument} from "tripledoc";

@entity(acl.Authorization)
export class AclAuthorization extends Entity{

    @field(acl.accessTo, {type: "ref"})
    public AccessTo: Reference;

    @field(acl.agent, {type: "ref", isArray: true})
    public Agents: Reference[];

    @field(acl.default__workaround, {type: "ref"})
    public Default: Reference;

    @field(acl.mode, {type: "ref", isArray: true})
    public Modes: Reference[];

    @field(acl.agentClass, {type: "ref"})
    public AgentClass: Reference;
}

@document(acl.Authorization)
export class AclDocument extends BaseDocument{

    constructor(baseURI: Reference, private owner: BaseDocument) {
        super(baseURI);
    }


    /** @internal **/
    protected async CreateDocument(): Promise<TripleDocument> {
        return null;
    }

    public async Init() {
        await super.Init();
        if (!this.doc)
             return ;
    }

    async InitACL(owner: Reference, ...rights: Reference[]) {
        this.doc = createDocument(this.URI) as TripleDocument;
        await this.InitRules(this.doc, owner, rights);
        this.doc = await this.doc.save();
        await this.Init();
    }

    /** @internal **/
    protected async InitRules(doc: BareTripleDocument, owner: Reference, rights: Reference[]){
        const mySubject = doc.addSubject({identifier: `owner`});
        const myAuth = new AclAuthorization(mySubject.asRef(), this, mySubject);
        myAuth.AccessTo = this.owner.URI;
        myAuth.Agents = [            owner        ]
        myAuth.Modes = [acl.Read, acl.Write, acl.Control];
        myAuth.Save();
        const otherSubject = doc.addSubject({identifier: `other`});
        const otherAuth = new AclAuthorization(otherSubject.asRef(), this, otherSubject);
        otherAuth.AccessTo = this.owner.URI;
        otherAuth.Default = this.owner.URI;
        otherAuth.AgentClass = foaf.Agent;
        otherAuth.Modes = rights;
        otherAuth.Save();

    }

    @entitySet(AclAuthorization, {isArray: true})
    public Rules: EntitySet<AclAuthorization>;

}


