import "jest";
import {getSession} from "./helpers/auth";
import {document, Document, entitySet, Person} from "../entry/node";
import {acl} from "rdf-namespaces";
import {ISession} from "../contracts";
import {POD} from "./helpers/auth";

@document()
export class TestDocument extends Document {

    @entitySet(Person)
    public TestEntity: Person;
}

describe('acl', () => {
    let doc: TestDocument;
    let session: ISession;
    beforeAll(async () => {
        session = await getSession();
        doc = new TestDocument(`${POD}/test8.ttl`);
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
})
