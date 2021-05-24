// @ts-ignore
import { timeout, suite, test, beforeAll, afterAll} from "@testdeck/jest";
import {getSession, POD} from "./helpers/auth";
import {ISession} from "../contracts";
import {entity, entityField, document, entitySet, field, Document, Entity, EntitySet} from "../repository";
import {schema} from "rdf-namespaces";

@suite('blank-node')
class BlankNodeSpec {

    session: ISession;
    doc: BlankNodeTestDocument;

    @timeout(20000)
    async before(){
        this.session = await getSession();
        this.doc = new BlankNodeTestDocument(`${POD}/tests/blank-node.ttl`);
        try {
            await this.doc.Remove().catch();
        }catch (e) {

        }
        await this.doc.Init();
    }


    @test
    @timeout(20000)
    async SetSingleEntityValue(){
        this.doc.Main.MainChild.Name = "Main";
        this.doc.Main.MainChild.Save();
        this.doc.Main.Name = "Main";
        this.doc.Main.Save();
        await this.doc.Save();
        this.doc = new BlankNodeTestDocument(this.doc.URI);
        await this.doc.Init();
        expect(this.doc.Main.Name).toBe("Main");
        expect(this.doc.Main.MainChild.Name).toBe("Main");
    }

    @test
    @timeout(20000)
    async AddDeleteValues(){
        const newChild = this.doc.Other.Add();
        newChild.Name = 'child';
        const grandChild = newChild.Children.Add();
        grandChild.Name = 'grand';
        grandChild.Save();
        newChild.Save();
        await this.doc.Save();
        this.doc = new BlankNodeTestDocument(this.doc.URI);
        await this.doc.Init();
        expect(this.doc.Other.Items.length).toBe(1);
        expect(this.doc.Other.Items[0].Name).toBe("child");
        expect(this.doc.Other.Items[0].Children.Items.length).toBe(1);
        expect(this.doc.Other.Items[0].Children.Items[0].Name).toBe("grand");
        console.log(this.doc.URI);
    }

    @timeout(20000)
    async after(){
        await this.doc.Remove();
    }
}

@entity('https://unknown.simple')
class SimpleEntity extends Entity{

    @field(schema.familyName, { type: "string"})
    public Name: string;
}

@entity('https://unknown.blank')
class BlankNodeTestEntity extends Entity{

    @entityField(SimpleEntity, "", {predicate: "https://unknown.main-child"})
    public MainChild: SimpleEntity;

    @entitySet(SimpleEntity, {predicate: "https://unknown.children"})
    public Children: EntitySet<SimpleEntity>;

    @field(schema.familyName, { type: "string"})
    public Name: string;
}

@document()
class BlankNodeTestDocument extends Document{

    @entityField(BlankNodeTestEntity, "#main")
    public Main: BlankNodeTestEntity;

    @entitySet(BlankNodeTestEntity)
    public Other: EntitySet<BlankNodeTestEntity>;
}
