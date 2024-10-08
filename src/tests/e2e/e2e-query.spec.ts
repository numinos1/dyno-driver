import "reflect-metadata";
import { describe, expect, it, jest } from '@jest/globals';
import { DynoModel } from '@/classes/dyno-model';
import { DynoDriver } from '@/classes/dyno-driver';
import { EntityMock } from '@/tests/mocks/entity.mock';
import { Entity2Mock } from '@/tests/mocks/entity-2.mock';
import { Entity3Mock } from '@/tests/mocks/entity-3.mock';
import { Entity4Mock } from '@/tests/mocks/entity-4.mock';
import { Item4Mock, item4Mock } from '@/tests/mocks/item-4.mock';
import { makeId } from "../test-utils";

const DocKeyRegex = /^repo#\w+\|doc#\w+$/;

describe('Query E2E', () => {
  const dyno = new DynoDriver({
    tableName: 'test-table',
    endpoint: "http://localhost:8000",
    region: "local",
    metrics: true,
    entities: [EntityMock, Entity2Mock, Entity4Mock],
  });

  beforeAll(() => dyno.resetTables());

  // // ----------------------------------------------------------------

  it('Get a model for an Entity', async () => {
    const model1 = dyno.model(EntityMock);
    const model2 = dyno.model(Entity2Mock);
    const model3 = dyno.model(Entity3Mock);

    expect(model1 instanceof DynoModel).toEqual(true);
    expect(model2 instanceof DynoModel).toEqual(true);
    expect(model3 instanceof DynoModel).toEqual(false);
  });

  // ----------------------------------------------------------------

  it('Create a document 1', async () => {
    const model = dyno.model(EntityMock);

    const putDoc = {
      repoId: 'abunker',
      id: '12345678',
      version: '1234',
      encoding: 'json',
      status: 'ready',
      createdBy: 'abunker',
      createdOn: Math.round(Date.now() / 1000),
      updatedBy: 'abunker',
      updatedOn: Math.round(Date.now() / 1000),
      body: Buffer.from(JSON.stringify({
        name: 'Paul Dineach',
        age: 53,
        address: '1945 Starcross Drive',
        city: 'Leyland',
        state: 'CT',
        zip: 84123,
        phone: '801-575-5555'
      }), 'utf8')
    };

    const putResult = await model.putOne(putDoc);

    expect(putResult.doc).toEqual(putDoc);

    const getResult = await model.getOne({
      id: '12345678',
      repoId: 'abunker',
    }, {
      consistent: true
    });

    expect(getResult.duration).toEqual(expect.any(Number));
    expect(getResult.cost).toEqual(expect.any(Number));
    expect(getResult.doc).toEqual(putDoc);
    expect(getResult.strategy).toEqual('getItem');
  });

  // ----------------------------------------------------------------

  it('Create a document 2', async () => {
    const model = dyno.model(Entity4Mock);
    const putDoc: Entity4Mock = item4Mock;

    const putResult = await model.putOne(putDoc);

    expect(putResult.doc).toEqual(putDoc);

    const getResult = await model.getOne({
      repoId: putDoc.repoId,
      docId: putDoc.docId
    }, {
      consistent: true
    });

    expect(getResult.duration).toEqual(expect.any(Number));
    expect(getResult.cost).toEqual(expect.any(Number));
    expect(getResult.doc).toEqual(putDoc);
    expect(getResult.strategy).toEqual('getItem');
  });

  // ----------------------------------------------------------------

  it('Update a document', async () => {
    const model = dyno.model(Entity4Mock);
    const putDoc1: Entity4Mock = Item4Mock();
    const putResult1 = await model.putOne(putDoc1);

    expect(putResult1.duration).toEqual(expect.any(Number));
    expect(putResult1.cost).toEqual(expect.any(Number));
    expect(putResult1.doc).toEqual(putDoc1);

    const putDoc2: Entity4Mock = Item4Mock(putDoc1);
    const putResult2 = await model.putOne(putDoc2);

    expect(putResult2.duration).toEqual(expect.any(Number));
    expect(putResult2.cost).toEqual(expect.any(Number));
    expect(putResult2.doc).toEqual(putDoc2);

    const getResult1 = await model.getOne({
      repoId: putDoc2.repoId,
      docId: putDoc2.docId
    }, {
      consistent: true
    });

    expect(getResult1.duration).toEqual(expect.any(Number));
    expect(getResult1.cost).toEqual(expect.any(Number));
    expect(getResult1.doc).toEqual(putDoc2);
    expect(getResult1.strategy).toEqual('getItem');
  });

  // ----------------------------------------------------------------

  it('Conditionally update a document', async () => {
    const model = dyno.model(Entity4Mock);
    const putDoc1: Entity4Mock = Item4Mock();
    await model.putOne(putDoc1);
     
    const putDoc2: Entity4Mock = Item4Mock(putDoc1);

    await expect(() =>
      model.putOne(putDoc2, {
        isBig: true,
        alias: 'xxxxxxxx'
      })
    ).rejects.toThrow(
      'The conditional request failed'
    );

    const result1 = await model.putOne(putDoc2, {
      isBig: false,
      alias: putDoc1.alias
    });

    expect(result1.duration).toEqual(expect.any(Number));
    expect(result1.cost).toEqual(expect.any(Number));
    expect(result1.doc).toEqual(putDoc2);

    const getResult1 = await model.getOne({
      repoId: putDoc1.repoId,
      docId: putDoc1.docId
    }, {
      consistent: true
    });

    expect(getResult1.duration).toEqual(expect.any(Number));
    expect(getResult1.cost).toEqual(expect.any(Number));
    expect(getResult1.doc).toEqual(putDoc2);
    expect(getResult1.strategy).toEqual('getItem');
  });

  // ----------------------------------------------------------------

  it('Conditionally create a document', async () => {
    const model = dyno.model(Entity4Mock);
    const putDoc1: Entity4Mock = Item4Mock();

    const result1 = await model.putOne(putDoc1, {
      repoId: { $exists: false },
      docId: { $exists: false }
    });

    expect(result1.doc).toEqual(putDoc1);

    await expect(() =>
      model.putOne(putDoc1, {
        repoId: { $exists: false },
        docId: { $exists: false }
      })
    ).rejects.toThrow(
      'The conditional request failed'
    );
  });

  // ----------------------------------------------------------------

  it('Put many documents', async () => {
    const model = dyno.model(Entity4Mock);
    const docs: Entity4Mock[] = [];

    for (let i = 0; i < 50; i++) {
      docs.push(Item4Mock({
        repoId: '1234abcdefg',
        docId: `AAAA${i}`
      }));
    }
    const results = await model.putMany(docs);

    expect(results.duration).toEqual(expect.any(Number));
    expect(results.cost).toEqual(expect.any(Number));
    expect(results.docs).toEqual(docs);
    expect(results.batches).toEqual([
      {
        id: 1,
        requests: 25,
        retryable: 0,
        wcu: 25,
        status: 'success',
        duration: expect.any(Number),
      },
      {
        id: 2,
        requests: 25,
        retryable: 0,
        wcu: 25,
        status: 'success',
        duration: expect.any(Number),
      }
    ]);
    expect(results.errors).toEqual([]);
    expect(results.failed).toEqual([]);
    expect(results.retries).toEqual(0);
    expect(results.saved).toEqual(expect.any(Array));
  });

  // ----------------------------------------------------------------

  it(`Query documents by one key`, async () => {
    const model = dyno.model(Entity4Mock);
    const docs: Entity4Mock[] = [];

    for (let i = 0; i < 10; i++) {
      docs.push(Item4Mock({
        repoId: 'onedocQuery',
        docId: `onedoc${i}`
      }));
    }
    await model.putMany(docs);

    const result1 = await model.getMany({
      repoId: 'onedocQuery',
      docId: 'onedoc7'
    }, {
      consistent: true
    });

    expect(result1.docs.length).toEqual(1);
    expect(result1.docs[0].docId).toEqual('onedoc7');
    expect(result1.strategy).toEqual('getItem')
  });

  // ----------------------------------------------------------------

   it(`Query documents in a table scan`, async () => {
    const model = dyno.model(Entity4Mock);
    const result2 = await model.getMany({
      total: { $gt: 1 },
      ages: { $contains: 3 }
    }, {
      consistent: true
    });
    
    expect(result2.docs.length).toEqual(63);
    expect(result2.strategy).toEqual('tableScan');
  });

  // ----------------------------------------------------------------

  it(`Get documents in a key range`, async () => {
    const model = dyno.model(Entity4Mock);
    const docs: Entity4Mock[] = [];

    for (let i = 0; i < 50; i++) {
      docs.push(Item4Mock({
        repoId: '123Query',
        docId: `BBB${i}`
      }));
    }
    await model.putMany(docs);

    const result2 = await model.getMany({
      repoId: '123Query',
      docId: { $between: ['BBB0', 'BBB2']}
    });

    expect(result2.docs.length).toEqual(13);
    expect(result2.strategy).toEqual('skQuery')
  });

  // ----------------------------------------------------------------

  it(`Get documents in a full table scan`, async () => {
    const model = dyno.model(Entity4Mock);

    await expect(() =>
      model.getMany({}, {
        order: 'asc',
        limit: 1000
      })
    ).rejects.toThrow('ScanTable does not support ordering');
  });

  // ----------------------------------------------------------------

  it(`Order Documents in a query (forward & reverse)`, async () => {
    const model = dyno.model(Entity4Mock);

    const resultFwd = await model.getMany(
      { repoId: '123Query' },
      { order: 'asc' }
    );
    expect(resultFwd.strategy).toEqual('pkQuery');
    expect(resultFwd.docs.length).toEqual(50);

    const resultRev = await model.getMany(
      { repoId: '123Query' },
      { order: 'desc' }
    );
    expect(resultRev.strategy).toEqual('pkQuery');
    expect(resultRev.docs.length).toEqual(50);

    const fwd = resultFwd.docs.map(doc => doc.docId);
    const rev = resultRev.docs.map(doc => doc.docId);

    expect(fwd).toEqual(rev.reverse());
  });

  // ----------------------------------------------------------------

  it(`get documents that contain substring`, async () => {
    const model = dyno.model(Entity4Mock);
    const docs: Entity4Mock[] = [];

    for (let i = 0; i < 30; i++) {
      docs.push(Item4Mock({
        repoId: 'xxxQuery',
        docId: `XXXXX${i}`,
        //alias: makeId(i + 3)
      }));
    }
    await model.putMany(docs);

    const result1 = await model.getMany({
      repoId: 'xxxQuery',
      names: { $contains: 'drew' }
    });

    expect(result1.docs.length).toEqual(30);
    expect(result1.strategy).toEqual('pkQuery');
  });

  // ----------------------------------------------------------------

  it(`get documents where string greater than size`, async () => {
    const model = dyno.model(Entity4Mock);
    const docs: Entity4Mock[] = [];

    for (let i = 0; i < 30; i++) {
      docs.push(Item4Mock({
        repoId: 'sizeQuery',
        docId: `size${i}`,
        alias: makeId(i + 1)
      }));
    }
    await model.putMany(docs);

    const result1 = await model.getMany({
      repoId: 'sizeQuery',
      alias: { $size: { $gt: 15 }}
    });

    expect(result1.docs.length).toEqual(15);
    expect(result1.strategy).toEqual('pkQuery');
  });

  // ----------------------------------------------------------------

  it(`get documents with nested or conditions`, async () => {
    const model = dyno.model(Entity4Mock);
    const docs: Entity4Mock[] = [];

    for (let i = 0; i < 30; i++) {
      docs.push(Item4Mock({
        repoId: 'orQuery',
        docId: `or${i}`,
        total: i + 100
      }));
    }
    await model.putMany(docs);

    const result1 = await model.getMany({
      repoId: 'orQuery',
      $or: [
        { total: { $gt: 120 } },
        { total: { $le: 105 } }
      ]
    });

    expect(result1.docs.length).toEqual(15);
    expect(result1.strategy).toEqual('pkQuery');

    const result2 = await model.getMany({
      repoId: 'orQuery',
      total: {
        $or: [
          { total: { $gt: 120 } },
          { total: { $le: 105 } }
        ]
      }
    });

    expect(result2.docs.length).toEqual(15);
    expect(result2.strategy).toEqual('pkQuery');
  });

  // ----------------------------------------------------------------

  it(`get documents in reverse order`, async () => {
    const model = dyno.model(Entity4Mock);
    const docs: Entity4Mock[] = [];

    for (let i = 0; i < 10; i++) {
      docs.push(Item4Mock({
        repoId: 'reverseQuery',
        docId: `reverse${i}`
      }));
    }
    await model.putMany(docs);

    const result1 = await model.getMany({
      repoId: 'reverseQuery',
      docId: { $between: ['reverse3', 'reverse7']}
    }, {
      order: 'desc'
    });

    expect(result1.docs.length).toEqual(5);
    expect(result1.docs.map(doc => doc.docId)).toEqual([
      'reverse7', 'reverse6', 'reverse5', 'reverse4', 'reverse3'
    ]);
    expect(result1.strategy).toEqual('skQuery');
    expect(result1.next).toEqual(undefined);
  });

  // ----------------------------------------------------------------

  it(`limit and paginate documents`, async () => {
    const model = dyno.model(Entity4Mock);
    const docs: Entity4Mock[] = [];

    for (let i = 0; i < 9; i++) {
      docs.push(Item4Mock({
        repoId: 'limitQuery',
        docId: `limit${i}`
      }));
    }
    await model.putMany(docs);

    const result1 = await model.getMany(
      { repoId: 'limitQuery' },
      { limit: 4 }
    );

    expect(result1.docs.length).toEqual(4);
    expect(result1.next).toEqual({
      docId: "limit3",
      repoId: "limitQuery"
    });

    const result2 = await model.getMany(
      { repoId: 'limitQuery' },
      {
        limit: 4,
        start: result1.next
      }
    );

    expect(result2.docs.length).toEqual(4);
    expect(result2.next).toEqual({
      docId: "limit7",
      repoId: "limitQuery"
    });

    const result3 = await model.getMany(
      { repoId: 'limitQuery' },
      {
        limit: 4,
        start: result2.next
      }
    );

    expect(result3.docs.length).toEqual(1);
    expect(result3.next).toEqual(undefined);
  });

});

