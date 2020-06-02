import "jest";
import {document, field, entitySet, AclDocument, Document, Person} from "../index";
import {acl} from "rdf-namespaces";
import {currentSession, login} from "./auth";
import {ISession} from "../contracts";

@document()
export class TestDocument extends Document{

    @entitySet(Person)
    public TestEntity: Person;
}

describe('acl', () => {
    let doc: TestDocument;
    let session: ISession;
    beforeAll(async ()=>{
        session = await currentSession() ?? await login();
        doc = new TestDocument('https://fransua.inrupt.net/tmp/test8.ttl');
        await doc.Init();
    },10000);

    it('should contain my rights', async ()=>{
        await doc.Acl.InitACL(session.webId, acl.Read);

    }, 10000);

    it('should be able to add smth', async ()=>{
        doc.TestEntity.FullName = "asdas adsdasd";
        doc.TestEntity.Save();
        await doc.Save();
    }, 10000);
})
