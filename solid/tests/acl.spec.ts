import {document, field, entityField, AclDocument, Document, Person} from "@solid";
import {AppContainer} from "../../container";
import {AuthAppService, ISession} from "@app";
import {acl} from "rdf-namespaces";
const authService = AppContainer.get<AuthAppService>(AuthAppService);

@document()
export class TestDocument extends Document{

    @entityField(Person)
    public TestEntity: Person;
}

describe('acl', () => {
    let doc: TestDocument;
    let session: ISession;
    beforeAll(async ()=>{
        session = await authService.GetSession();
        doc = new TestDocument('https://fransua.inrupt.net/private/test8.ttl');
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
