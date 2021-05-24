// // @ts-ignore
// import { timeout, suite, test, beforeAll, afterAll} from "@testdeck/jest";
// import {TestEntityDocument} from "./helpers/test.entity";
// import {getSession, POD} from "./helpers/auth";
// import {ISession} from "../contracts";
//
// @suite
// class TwoDocsSpec {
//     private session: ISession;
//     private doc1: TestEntityDocument;
//     private doc2: TestEntityDocument;
//
//     @timeout(20000)
//     async before(){
//         this.session = await getSession();
//         this.doc1 = new TestEntityDocument(`${POD}/t1.ttl`);
//         try {
//             await this.doc1.Remove().catch();
//         }catch (e) {
//
//         }
//         this.doc2 = new TestEntityDocument(`${POD}/t1.ttl`)
//         await this.doc1.Init()
//         await this.doc2.Init()
//         await this.doc1.Subscribe();
//         await this.doc2.Subscribe();
//     }
//
//     @test
//     @timeout(20000)
//     async world() {
//         const entityA1 = this.doc1.Entities.Add();
//         entityA1.Content = 'A';
//         entityA1.Save();
//         const entityB2 = this.doc2.Entities.Add();
//         entityB2.Content = 'B';
//         entityB2.Save();
//         expect(entityA1.Id).not.toBe(entityB2.Id);
//         const updates = Promise.all([
//             new Promise<void>(resolve => this.doc1.on('update', () => {
//                 resolve();
//                 console.log('update doc 1', this.doc1.Entities.Items.length);
//             })),
//             new Promise<void>(resolve => this.doc2.on('update', () => {
//                 resolve();
//                 console.log('update doc 2', this.doc1.Entities.Items.length);
//             })),
//         ]);
//
//         await this.doc2.Save();
//         console.log('saved doc 2');
//         await this.doc1.Save();
//         console.log('saved doc 1');
//         await updates;
//         const entityA2 = this.doc2.Entities.get(entityA1.Id);
//         const entityB1 = this.doc1.Entities.get(entityB2.Id);
//         // @ts-ignore
//         expect(entityA2.Content).toEqual(entityA1.Content);
//         expect(entityB2.Content).toEqual(entityB1.Content);
//     }
//
//     @timeout(20000)
//     async after(){
//         await this.doc1.Unsubscribe();
//         await this.doc2.Unsubscribe();
//         await this.doc1.Remove()
//     }
// }
