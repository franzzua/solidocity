import { DataFactory, Writer, Parser } from 'n3';
import type { Quad, Triple } from 'n3';
import { Reference } from '../contracts';
import quad = DataFactory.quad;

/**
 * @param quads Triples that should be serialised to Turtle
 * @internal Utility method for internal use by Tripledoc; not part of the public API.
 */
export async function triplesToTurtle(triples: ReadonlyArray<Triple>): Promise<string> {
    const format = 'text/turtle';
    const writer = new Writer({ format: format });
    // Remove any potentially lingering references to Documents in Quads;
    // they'll be determined by the URL the Turtle will be sent to:
    // for (let triple of triples) {
    //     if (triple.subject.termType == "BlankNode")
    //         continue;
    //     if (triple.object.termType == "BlankNode") {
    //         const subjects = triples
    //             .filter(x => x.subject.equals(triple.object))
    //             .map(x => ({
    //                 predicate: x.predicate,
    //                 object: x.object
    //             }));
    //         writer.addQuad(quad(
    //             triple.subject,
    //             triple.predicate,
    //             writer.blank(subjects)
    //         ));
    //     }else{
    //         writer.addQuad(triple);
    //     }
    // }
    writer.addQuads([...triples]);
    const writePromise = new Promise<string>((resolve, reject) => {
        writer.end((error, result) => {
            /* istanbul ignore if [n3.js doesn't actually pass an error nor a result, apparently: https://github.com/rdfjs/N3.js/blob/62682e48c02d8965b4d728cb5f2cbec6b5d1b1b8/src/N3Writer.js#L290] */
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });

    const rawTurtle = await writePromise;
    return rawTurtle;
}

/**
 * @param raw Turtle that should be parsed into Triples
 * @internal Utility method for internal use by Tripledoc; not part of the public API.
 */
export async function turtleToTriples(raw: string, documentRef: Reference): Promise<Triple[]> {
    const format = 'text/turtle';
    const parser = new Parser({ format: format, baseIRI: documentRef });

    const parsingPromise = new Promise<Triple[]>((resolve, reject) => {
        const parsedTriples: Triple[] = [];
        parser.parse(raw, (error, triple, _prefixes) => {
            if (error) {
                return reject(error);
            }
            if (triple) {
                parsedTriples.push(triple);
            } else {
                resolve(parsedTriples);
            }
        });
    });

    return parsingPromise;
}
