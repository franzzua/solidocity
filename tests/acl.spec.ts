import "jest";
import {getSession} from "./helpers/auth";
import {AclDocument, document, Document, entityField, entitySet, Person} from "../entry/node";
import {acl, as} from "rdf-namespaces";
import {ISession} from "../contracts";
import {POD} from "./helpers/auth";
import {authFetch} from "../impl/auth";

@document()
export class TestDocument extends Document {

    @entityField(Person, 'person')
    public TestEntity: Person;
}

describe('acl', () => {
    let doc: TestDocument;
    let session: ISession;
    beforeAll(async () => {
        session = await getSession();
        doc = new TestDocument(`${POD}/private/test5.ttl`);
        await doc.Init();
    }, 20000);

    it('should contain my rights', async () => {
        await doc.Acl.InitACL(session.webId, acl.Read);
    }, 20000);

    it('should be able to add smth', async () => {
        doc.TestEntity.FullName = "asdas adsdasd";
        doc.TestEntity.Save();
        await doc.Save();
    }, 20000);

    afterAll(async () => {
        await doc.Remove();
    })
})
