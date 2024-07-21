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

  // // ----------------------------------------------------------------

  it('creates dynamo tables', async () => {
    
    const namesBefore = await dyno.getDynamoTableNames();
    await dyno.deleteTables(namesBefore);

    const schemas = await dyno.exportMigrationSchemas();

    const createTables = schemas
      .filter(schema => schema.diffStatus === 'CREATE')
      .map(schema => schema.modelSchema);

    await dyno.createTables(createTables);

    const namesAfter = await dyno.getDynamoTableNames();

    expect(namesAfter).toEqual(['test-table', 'types-table']);
  });

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

    expect(putResult.duration).toEqual(expect.any(Number));
    expect(putResult.cost).toEqual(expect.any(Number));
    expect(putResult.doc).toEqual(putDoc);

    const getResult = await model.getOne({
      where: {
        id: '12345678',
        repoId: 'abunker',
      },
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

    expect(putResult.duration).toEqual(expect.any(Number));
    expect(putResult.cost).toEqual(expect.any(Number));
    expect(putResult.doc).toEqual(putDoc);

    const getResult = await model.getOne({
      where: {
        repoId: putDoc.repoId,
        docId: putDoc.docId
      },
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
      where: {
        repoId: putDoc2.repoId,
        docId: putDoc2.docId
      },
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
      where: {
        repoId: putDoc1.repoId,
        docId: putDoc1.docId
      },
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
    expect(results.results).toEqual({
      batches: [{
        id: 1,
        requests: 25,
        retryable: 0,
        wcu: 25,
        status: 'success',
        duration: expect.any(Number),
      }, {
        id: 2,
        requests: 25,
        retryable: 0,
        wcu: 25,
        status: 'success',
        duration: expect.any(Number),
      }],
      errors: [],
      failed: [],
      retries: 0,
      saved: expect.any(Array)
    });
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
      where: {
        repoId: '123Query',
        docId: { $between: ['BBB0', 'BBB2']}
      }
    });

    expect(result2.docs.length).toEqual(13);
    expect(result2.strategy).toEqual('skQuery')
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
      where: {
        repoId: 'xxxQuery',
        names: { $contains: 'drew' }
      }
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
      where: {
        repoId: 'sizeQuery',
        alias: { $size: { $gt: 15 }}
      }
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
      where: {
        repoId: 'orQuery',
        $or: [
          { total: { $gt: 120 } },
          { total: { $le: 105 } }
        ]
      }
    });

    expect(result1.docs.length).toEqual(15);
    expect(result1.strategy).toEqual('pkQuery');

    const result2 = await model.getMany({
      where: {
        repoId: 'orQuery',
        total: {
          $or: [
            { total: { $gt: 120 } },
            { total: { $le: 105 } }
          ]
        }
      }
    });

    expect(result2.docs.length).toEqual(15);
    expect(result2.strategy).toEqual('pkQuery');
  });

});

