import { Entity3Mock } from './../mocks/entity-3.mock';
import "reflect-metadata";
import { DynoModel } from '../../src/classes/dyno-model';
import { describe, expect, it } from '@jest/globals';
import { DynoDriver } from '../../src/classes/dyno-driver';
import { EntityMock } from '../mocks/entity.mock';
import { Entity2Mock } from '../mocks/entity-2.mock';

describe('Query E2E', () => {
  const dyno = new DynoDriver({
    tableName: 'test-table',
    endpoint: "http://localhost:8000",
    region: "local",
    metrics: true,
    entities: [EntityMock, Entity2Mock]
  });

  // ----------------------------------------------------------------

  it('creates dynamo tables', async () => {
    
    const namesBefore = await dyno.getDynamoTableNames();

    await dyno.deleteTables(namesBefore);

    const schemas = await dyno.exportMigrationSchemas();
    const createTables = schemas
      .filter(schema => schema.diffStatus === 'CREATE')
      .map(schema => schema.modelSchema);

    await dyno.createTables(createTables);

    const namesAfter = await dyno.getDynamoTableNames();

    expect(namesAfter).toEqual(['test-table']);
  });

  // ----------------------------------------------------------------

  it('Get a model for an Entity', async () => {
    const model1 = dyno.model(EntityMock);
    const model2 = dyno.model(Entity2Mock);
    const model3 = dyno.model(Entity3Mock);

    expect(model1 instanceof DynoModel).toEqual(true);
    expect(model2 instanceof DynoModel).toEqual(true);
    expect(model3 instanceof DynoModel).toEqual(false);
  });

  // ----------------------------------------------------------------

  it('Put a document', async () => {
    const model: DynoModel<EntityMock> = dyno.model(EntityMock);

    const result = model.getOne({
      where: {
        asdfafdadff: { a: 2 },
        id: '1324242',
        repoId: 'aasdfsaf',
      }
    });
  });
});
