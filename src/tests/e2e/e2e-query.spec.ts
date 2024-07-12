import "reflect-metadata";
import { describe, expect, it } from '@jest/globals';
import { DynoModel } from '@/classes/dyno-model';
import { DynoDriver } from '@/classes/dyno-driver';
import { EntityMock } from '@/tests/mocks/entity.mock';
import { Entity2Mock } from '@/tests/mocks/entity-2.mock';
import { Entity3Mock } from '@/tests/mocks/entity-3.mock';
import { Entity4Mock } from '@/tests/mocks/entity-4.mock';

describe('Query E2E', () => {
  const dyno = new DynoDriver({
    tableName: 'test-table',
    endpoint: "http://localhost:8000",
    region: "local",
    metrics: true,
    entities: [EntityMock, Entity2Mock, Entity4Mock]
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

  it('Put and Get a document', async () => {
    const model = dyno.model(EntityMock);
    const now = Math.round(Date.now() / 1000);

    const body = {
      name: 'Andrew Bunker',
      age: 53,
      address: '166 1675 South',
      city: 'Farmington',
      state: 'UT',
      zip: 84025,
      phone: '801-580-1203'
    };

    const createDoc = {
      repoId: 'abunker',
      id: '12345678',
      version: '1234',
      encoding: 'json',
      status: 'ready',
      createdBy: 'abunker',
      createdOn: now,
      updatedBy: 'abunker',
      updatedOn: now,
      body: Buffer.from(JSON.stringify(body), 'utf8')
    };

    await model.putOne(createDoc);

    const readDoc = await model.getOne({
      where: {
        id: '12345678',
        repoId: 'abunker',
      },
      consistent: true
    });

    expect(readDoc).toEqual(createDoc);
    expect(JSON.parse(readDoc.body.toString('utf8'))).toEqual(body);
  });

  // ----------------------------------------------------------------

  it('Put and Get a document with all data-types', async () => {
    const model = dyno.model(Entity4Mock);

    const putDoc: Entity4Mock = {
      id: '123456',
      repoId: 123456,
      isBig: true,
      ages: [1, 25, 53, 14, 21, 47],
      names: ['andrew', 'sylvia', 'sam', 'analee'],
      list: [1, 2, 'three', 'four', true, [1, 2, 3, 4], { a: 1 }],
      colors: new Set(['a', 'b', 'c']),
      years: new Set([1, 2, 3, 4]),
      meta: { a: 1, b: '1234', c: [1, 2, 3], d: { e: { f: 12233 } } },
      meta2: { a: 1, b: 2, c: 3 },
      body: Buffer.from(JSON.stringify({
        name: 'Andrew Bunker',
        age: 53,
        address: '166 1675 South',
        city: 'Farmington',
        state: 'UT',
        zip: 84025,
        phone: '801-580-1203'
      }), 'utf8')
    };

    await model.putOne(putDoc);

    const getDoc = await model.getOne({
      where: {
        id: '123456',
        repoId: 123456
      },
      consistent: true
    });

    expect(getDoc).toEqual(putDoc);
  });
});
