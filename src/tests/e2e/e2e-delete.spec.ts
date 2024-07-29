import "reflect-metadata";
import { describe, expect, it, jest } from '@jest/globals';
import { DynoDriver } from '@/classes/dyno-driver';
import { Entity5Mock } from '@/tests/mocks/entity-5.mock';
import { Item5Mock } from "../mocks/entity-5.item";
import { makeId } from "../test-utils";
import { DynoModel } from "@/classes/dyno-model";
import { setTimeout } from 'node:timers/promises';

const DocKeyRegex = /^repo#\w+\|doc#\w+$/;

describe('Entity5Mock Tests', () => {
  let dyno: DynoDriver;
  let model: DynoModel<Entity5Mock>;
  let doc: Entity5Mock;

  // ----------------------------------------------------------------

  beforeAll(async () => {
    dyno = new DynoDriver({
      tableName: 'mock5-table',
      endpoint: "http://localhost:8000",
      region: "local",
      metrics: true,
      entities: [Entity5Mock],
    });

    await dyno.resetTables();

    model = dyno.model(Entity5Mock);
  });

  // ----------------------------------------------------------------

  it('put document', async () => {
    const putDoc = Item5Mock();
    const putResult = await model.putOne(putDoc);

    expect(putResult.doc).toEqual(putDoc);

    doc = putDoc;
  });

  // ----------------------------------------------------------------

  it('should throw if consistently querying GSI', async () => {
    expect(async () => {
      await model.getOne({
        consistent: true,
        where: {
          docId: doc.docId
        }
      });
    }).rejects.toThrow(
      'Consistent read cannot be true when querying a GSI'
    );
  });

  // ----------------------------------------------------------------

  // it('get by primary key', async () => {
  //   const getResult = await model.getOne({
  //     consistent: true,
  //     where: {
  //       repoId: doc.repoId,
  //       docId: doc.docId
  //     }
  //   });
  //   expect(getResult.duration).toEqual(expect.any(Number));
  //   expect(getResult.cost).toEqual(1);
  //   expect(getResult.doc).toEqual(doc);
  //   expect(getResult.strategy).toEqual('getItem');
  //   expect(getResult.table).toEqual("mock5-table");
  //   expect(getResult.index).toEqual(undefined);
  // });

  // ----------------------------------------------------------------

  it('get by secondary key', async () => {
    //await setTimeout(1000);
    const getResult = await model.getOne({
      //consistent: true,
      where: {
        docId: doc.docId
      }
    });
    expect(getResult.duration).toEqual(expect.any(Number));
    expect(getResult.cost).toEqual(0.5);
    expect(getResult.doc).toEqual(doc);
    expect(getResult.strategy).toEqual('skQuery');
    expect(getResult.table).toEqual("mock5-table");
    expect(getResult.index).toEqual("mock5-table-gsi-1");
  });

//   // ----------------------------------------------------------------

//   it('Update a document', async () => {
//     const model = dyno.model(Entity5Mock);
//     const putDoc1: Entity5Mock = Item4Mock();
//     const putResult1 = await model.putOne(putDoc1);

//     expect(putResult1.duration).toEqual(expect.any(Number));
//     expect(putResult1.cost).toEqual(expect.any(Number));
//     expect(putResult1.doc).toEqual(putDoc1);

//     const putDoc2: Entity5Mock = Item4Mock(putDoc1);
//     const putResult2 = await model.putOne(putDoc2);

//     expect(putResult2.duration).toEqual(expect.any(Number));
//     expect(putResult2.cost).toEqual(expect.any(Number));
//     expect(putResult2.doc).toEqual(putDoc2);

//     const getResult1 = await model.getOne({
//       where: {
//         repoId: putDoc2.repoId,
//         docId: putDoc2.docId
//       },
//       consistent: true
//     });

//     expect(getResult1.duration).toEqual(expect.any(Number));
//     expect(getResult1.cost).toEqual(expect.any(Number));
//     expect(getResult1.doc).toEqual(putDoc2);
//     expect(getResult1.strategy).toEqual('getItem');
//   });

//   // ----------------------------------------------------------------

//   it('Conditionally update a document', async () => {
//     const model = dyno.model(Entity5Mock);
//     const putDoc1: Entity5Mock = Item4Mock();
//     await model.putOne(putDoc1);
     
//     const putDoc2: Entity5Mock = Item4Mock(putDoc1);

//     await expect(() =>
//       model.putOne(putDoc2, {
//         isBig: true,
//         alias: 'xxxxxxxx'
//       })
//     ).rejects.toThrow(
//       'The conditional request failed'
//     );

//     const result1 = await model.putOne(putDoc2, {
//       isBig: false,
//       alias: putDoc1.alias
//     });

//     expect(result1.duration).toEqual(expect.any(Number));
//     expect(result1.cost).toEqual(expect.any(Number));
//     expect(result1.doc).toEqual(putDoc2);

//     const getResult1 = await model.getOne({
//       where: {
//         repoId: putDoc1.repoId,
//         docId: putDoc1.docId
//       },
//       consistent: true
//     });

//     expect(getResult1.duration).toEqual(expect.any(Number));
//     expect(getResult1.cost).toEqual(expect.any(Number));
//     expect(getResult1.doc).toEqual(putDoc2);
//     expect(getResult1.strategy).toEqual('getItem');
//   });

//   // ----------------------------------------------------------------

//   it('Conditionally create a document', async () => {
//     const model = dyno.model(Entity5Mock);
//     const putDoc1: Entity5Mock = Item4Mock();

//     const result1 = await model.putOne(putDoc1, {
//       repoId: { $exists: false },
//       docId: { $exists: false }
//     });

//     expect(result1.doc).toEqual(putDoc1);

//     await expect(() =>
//       model.putOne(putDoc1, {
//         repoId: { $exists: false },
//         docId: { $exists: false }
//       })
//     ).rejects.toThrow(
//       'The conditional request failed'
//     );
//   });

//   // ----------------------------------------------------------------

//   it('Put many documents', async () => {
//     const model = dyno.model(Entity5Mock);
//     const docs: Entity5Mock[] = [];

//     for (let i = 0; i < 50; i++) {
//       docs.push(Item4Mock({
//         repoId: '1234abcdefg',
//         docId: `AAAA${i}`
//       }));
//     }
//     const results = await model.putMany(docs);

//     expect(results.duration).toEqual(expect.any(Number));
//     expect(results.cost).toEqual(expect.any(Number));
//     expect(results.docs).toEqual(docs);
//     expect(results.results).toEqual({
//       batches: [{
//         id: 1,
//         requests: 25,
//         retryable: 0,
//         wcu: 25,
//         status: 'success',
//         duration: expect.any(Number),
//       }, {
//         id: 2,
//         requests: 25,
//         retryable: 0,
//         wcu: 25,
//         status: 'success',
//         duration: expect.any(Number),
//       }],
//       errors: [],
//       failed: [],
//       retries: 0,
//       saved: expect.any(Array)
//     });
//   });

//   // ----------------------------------------------------------------

//   it(`Query documents by one key`, async () => {
//     const model = dyno.model(Entity5Mock);
//     const docs: Entity5Mock[] = [];

//     for (let i = 0; i < 10; i++) {
//       docs.push(Item4Mock({
//         repoId: 'onedocQuery',
//         docId: `onedoc${i}`
//       }));
//     }
//     await model.putMany(docs);

//     const result1 = await model.getMany({
//       where: {
//         repoId: 'onedocQuery',
//         docId: 'onedoc7'
//       },
//       consistent: true
//     });

//     expect(result1.docs.length).toEqual(1);
//     expect(result1.docs[0].docId).toEqual('onedoc7');
//     expect(result1.strategy).toEqual('getItem')
//   });

//    // ----------------------------------------------------------------

//    it(`Query documents in a table scan`, async () => {
//     const model = dyno.model(Entity5Mock);
//     const result2 = await model.getMany({
//       where: {
//         total: { $gt: 1 },
//         ages: { $contains: 3 }
//       },
//       consistent: true
//     });
    
//     expect(result2.docs.length).toEqual(63);
//     expect(result2.strategy).toEqual('tableScan');
//   });

//   // ----------------------------------------------------------------

//   it(`Get documents in a key range`, async () => {
//     const model = dyno.model(Entity5Mock);
//     const docs: Entity5Mock[] = [];

//     for (let i = 0; i < 50; i++) {
//       docs.push(Item4Mock({
//         repoId: '123Query',
//         docId: `BBB${i}`
//       }));
//     }
//     await model.putMany(docs);

//     const result2 = await model.getMany({
//       where: {
//         repoId: '123Query',
//         docId: { $between: ['BBB0', 'BBB2']}
//       }
//     });

//     expect(result2.docs.length).toEqual(13);
//     expect(result2.strategy).toEqual('skQuery')
//   });

//   // ----------------------------------------------------------------

//   it(`Get documents in a table scan`, async () => {
//     const model = dyno.model(Entity5Mock);
//     const result2 = await model.getMany({
//       limit: 5
//     });

//     expect(result2.docs.length).toEqual(5);
//     expect(result2.strategy).toEqual('tableScan')
//   });

//   // ----------------------------------------------------------------

//   it(`get documents that contain substring`, async () => {
//     const model = dyno.model(Entity5Mock);
//     const docs: Entity5Mock[] = [];

//     for (let i = 0; i < 30; i++) {
//       docs.push(Item4Mock({
//         repoId: 'xxxQuery',
//         docId: `XXXXX${i}`,
//         //alias: makeId(i + 3)
//       }));
//     }
//     await model.putMany(docs);

//     const result1 = await model.getMany({
//       where: {
//         repoId: 'xxxQuery',
//         names: { $contains: 'drew' }
//       }
//     });

//     expect(result1.docs.length).toEqual(30);
//     expect(result1.strategy).toEqual('pkQuery');
//   });

//   // ----------------------------------------------------------------

//   it(`get documents where string greater than size`, async () => {
//     const model = dyno.model(Entity5Mock);
//     const docs: Entity5Mock[] = [];

//     for (let i = 0; i < 30; i++) {
//       docs.push(Item4Mock({
//         repoId: 'sizeQuery',
//         docId: `size${i}`,
//         alias: makeId(i + 1)
//       }));
//     }
//     await model.putMany(docs);

//     const result1 = await model.getMany({
//       where: {
//         repoId: 'sizeQuery',
//         alias: { $size: { $gt: 15 }}
//       }
//     });

//     expect(result1.docs.length).toEqual(15);
//     expect(result1.strategy).toEqual('pkQuery');
//   });

//   // ----------------------------------------------------------------

//   it(`get documents with nested or conditions`, async () => {
//     const model = dyno.model(Entity5Mock);
//     const docs: Entity5Mock[] = [];

//     for (let i = 0; i < 30; i++) {
//       docs.push(Item4Mock({
//         repoId: 'orQuery',
//         docId: `or${i}`,
//         total: i + 100
//       }));
//     }
//     await model.putMany(docs);

//     const result1 = await model.getMany({
//       where: {
//         repoId: 'orQuery',
//         $or: [
//           { total: { $gt: 120 } },
//           { total: { $le: 105 } }
//         ]
//       }
//     });

//     expect(result1.docs.length).toEqual(15);
//     expect(result1.strategy).toEqual('pkQuery');

//     const result2 = await model.getMany({
//       where: {
//         repoId: 'orQuery',
//         total: {
//           $or: [
//             { total: { $gt: 120 } },
//             { total: { $le: 105 } }
//           ]
//         }
//       }
//     });

//     expect(result2.docs.length).toEqual(15);
//     expect(result2.strategy).toEqual('pkQuery');
//   });

//   // ----------------------------------------------------------------

//   it(`get documents in reverse order`, async () => {
//     const model = dyno.model(Entity5Mock);
//     const docs: Entity5Mock[] = [];

//     for (let i = 0; i < 10; i++) {
//       docs.push(Item4Mock({
//         repoId: 'reverseQuery',
//         docId: `reverse${i}`
//       }));
//     }
//     await model.putMany(docs);

//     const result1 = await model.getMany({
//       where: {
//         repoId: 'reverseQuery',
//         docId: { $between: ['reverse3', 'reverse7']}
//       },
//       order: 'desc'
//     });

//     expect(result1.docs.length).toEqual(5);
//     expect(result1.docs.map(doc => doc.docId)).toEqual([
//       'reverse7', 'reverse6', 'reverse5', 'reverse4', 'reverse3'
//     ]);
//     expect(result1.strategy).toEqual('skQuery');
//     expect(result1.next).toEqual(undefined);
//   });

//   // ----------------------------------------------------------------

//   it(`limit and paginate documents`, async () => {
//     const model = dyno.model(Entity5Mock);
//     const docs: Entity5Mock[] = [];

//     for (let i = 0; i < 9; i++) {
//       docs.push(Item4Mock({
//         repoId: 'limitQuery',
//         docId: `limit${i}`
//       }));
//     }
//     await model.putMany(docs);

//     const result1 = await model.getMany({
//       where: {
//         repoId: 'limitQuery'
//       },
//       limit: 4
//     });

//     expect(result1.docs.length).toEqual(4);
//     expect(result1.next).toEqual({
//       docId: "limit3",
//       repoId: "limitQuery"
//     });

//     const result2 = await model.getMany({
//       where: {
//         repoId: 'limitQuery'
//       },
//       limit: 4,
//       start: result1.next
//     });

//     expect(result2.docs.length).toEqual(4);
//     expect(result2.next).toEqual({
//       docId: "limit7",
//       repoId: "limitQuery"
//     });

//     const result3 = await model.getMany({
//       where: {
//         repoId: 'limitQuery'
//       },
//       limit: 4,
//       start: result2.next
//     });

//     expect(result3.docs.length).toEqual(1);
//     expect(result3.next).toEqual(undefined);
//   });

//   // ----------------------------------------------------------------

//   it(`delete a document by primary key`, async () => {
//     const model = dyno.model(Entity5Mock);
//     const doc: Entity5Mock = Item4Mock({
//       repoId: 'delete1Query',
//       docId: `delete1`
//     });

//     await model.putOne(doc);

//     const result = await model.deleteOne({
//       repoId: doc.repoId,
//       docId: doc.docId
//     });

//     expect(result.doc).toEqual(doc);
//     expect(result.cost).toEqual(1);
//   });

//   // ----------------------------------------------------------------

//   it(`conditionally delete a document`, async () => {
//     const model = dyno.model(Entity5Mock);
//     const doc: Entity5Mock = Item4Mock({
//       repoId: 'delete1Query',
//       docId: `delete1`
//     });

//     await model.putOne(doc);

//     await expect(() =>
//       model.deleteOne({
//         repoId: doc.repoId,
//         docId: doc.docId,
//         isBig: true
//       })
//     ).rejects.toThrow('The conditional request failed');

//     const result = await model.deleteOne({
//       repoId: doc.repoId,
//       docId: doc.docId,
//       isBig: false
//     })

//     expect(result.doc).toEqual(doc);
//     expect(result.cost).toEqual(1);
//   });

});

