import "jest";
import {timeout, suite, test} from "@testdeck/jest";
import {RdfSubject} from "../../rdf/RdfSubject";
import {DataFactory} from "n3";
import {ConflictError} from "../../rdf/values/rdf-scalar";
import {MockRdfRepository} from "./mock.rdf-repository";
import {RdfDocument} from "../../rdf/RdfDocument";

@suite
export class RdfDocSpec {

    private repo = new MockRdfRepository([]);
    private doc1 = new RdfDocument(this.repo);
    private doc2 = new RdfDocument(this.repo);

    @test
    async addSubject() {
        const doc2update = new Promise<void>(resolve => {
            this.doc2.Subscribe(() => resolve());
        });
        const subj = this.doc1.addSubject('test');
        subj.Scalar('name', 'string').set('John');
        this.doc1.Save();
        await doc2update;
        const subj2 = this.doc2.getSubject('test');
        const value = subj2.Scalar('name', 'string').get();
        expect(value).toBe('John');
    }


    @test
    async conflict() {
        const subj = this.doc1.addSubject('test');
        subj.Scalar('name', 'string').set('John');
        this.doc1.Save();

        const subj2 = this.doc2.addSubject('test');
        subj2.Scalar('name', 'string').set('Vasya');
        this.doc2.Save();

        await this.doc2.Load();
        await this.doc1.Load();
        let error;
        try {
            this.doc1.getSubject('test').Scalar('name', 'string').get()
        } catch (e) {
            error = e;
        }
        expect(error).not.toBe(null);
    }


}
