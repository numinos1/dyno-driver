import "reflect-metadata";
import { describe, expect, it, jest } from '@jest/globals';
import { DynoModel, GetOptions } from '@/classes/dyno-model';
import { DynoDriver } from '@/classes/dyno-driver';
import { EntityMock } from '@/tests/mocks/entity.mock';
import { Entity2Mock } from '@/tests/mocks/entity-2.mock';
import { Entity3Mock } from '@/tests/mocks/entity-3.mock';
import { Entity4Mock } from '@/tests/mocks/entity-4.mock';
import { Item4Mock, item4Mock } from '@/tests/mocks/item-4.mock';

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

    expect(putResult).toEqual({
      duration: expect.any(Number),
      cost: expect.any(Number),
      doc: putDoc
    });

    const getResult = await model.getOne({
      where: {
        id: '12345678',
        repoId: 'abunker',
      },
      consistent: true
    });

    expect(getResult).toEqual({
      duration: expect.any(Number),
      cost: expect.any(Number),
      strategy: 'getItem',
      doc: putDoc
    });
  });

  // ----------------------------------------------------------------

  it('Create a document 2', async () => {
    const model = dyno.model(Entity4Mock);
    const putDoc: Entity4Mock = item4Mock;

    const putResult = await model.putOne(putDoc);

    expect(putResult).toEqual({
      duration: expect.any(Number),
      cost: expect.any(Number),
      doc: putDoc
    });

    const getResult = await model.getOne({
      where: {
        repoId: putDoc.repoId,
        docId: putDoc.docId
      },
      consistent: true
    });

    expect(getResult).toEqual({
      duration: expect.any(Number),
      cost: expect.any(Number),
      strategy: 'getItem',
      doc: putDoc
    });
  });

  // ----------------------------------------------------------------

  it('Update a document', async () => {
    const model = dyno.model(Entity4Mock);
    const putDoc1: Entity4Mock = Item4Mock();
    const putResult1 = await model.putOne(putDoc1);

    expect(putResult1).toEqual({
      duration: expect.any(Number),
      cost: expect.any(Number),
      doc: putDoc1
    });

    const putDoc2: Entity4Mock = Item4Mock(putDoc1);
    const putResult2 = await model.putOne(putDoc2);

    expect(putResult2).toEqual({
      duration: expect.any(Number),
      cost: expect.any(Number),
      doc: putDoc2
    });

    const getResult1 = await model.getOne({
      where: {
        repoId: putDoc2.repoId,
        docId: putDoc2.docId
      },
      consistent: true
    });

    expect(getResult1).toEqual({
      duration: expect.any(Number),
      cost: expect.any(Number),
      strategy: 'getItem',
      doc: putDoc2
    });
  });

  // ----------------------------------------------------------------

  it('Conditional update a document', async () => {
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

    expect(result1).toEqual({
      duration: expect.any(Number),
      cost: expect.any(Number),
      doc: putDoc2
    });

    const getResult1 = await model.getOne({
      where: {
        repoId: putDoc1.repoId,
        docId: putDoc1.docId
      },
      consistent: true
    });

    expect(getResult1).toEqual({
      duration: expect.any(Number),
      cost: expect.any(Number),
      strategy: 'getItem',
      doc: putDoc2
    });
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

    expect(results).toEqual({
      duration: expect.any(Number),
      cost: expect.any(Number),
      results: {
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
      },
      docs: docs
    });

    // results.saved.forEach(result => {
    //   expect(result).toMatch(DocKeyRegex)
    // });
  });

  // ----------------------------------------------------------------

  // it(`Query multiple documents in a range`, async () => {
  //   const model = dyno.model(Entity4Mock);
  //   const spyLog = jest.spyOn(logger, 'log');
  //   const docs = await model.getMany({
  //     where: {
  //       repoId: '1234abcdefg',
  //       docId: {
  //         $between: ['AAAA0', 'AAAA15']
  //       }
  //     }
  //   });

  //   expect(docs.length).toEqual(8);
  //   expect(spyLog).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       strategy:
  //         expect.objectContaining({
  //           type: 2
  //         })
  //      })
  //   );
  //   spyLog.mockRestore();
  // });

   // ----------------------------------------------------------------

  // it(`Scan multiple documents in a range`, async () => {
  //   const model = dyno.model(Entity4Mock);
  //   const spyLog = jest.spyOn(logger, 'log');
  //   const docs = await model.getMany({
  //     where: {
  //       docId: {
  //         $and: [
  //           { docId: { $ge: 'AAAA0' } },
  //           { docId: { $le: 'AAAA15' } }
  //         ]
  //       }
  //     }
  //   });

  //   expect(docs.length).toEqual(8);
  //   expect(spyLog).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       strategy:
  //         expect.objectContaining({
  //           type: 0
  //         })
  //      })
  //   );
  //   spyLog.mockRestore();
  // });

});

