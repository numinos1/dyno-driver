import "reflect-metadata";
import { describe, expect, it } from '@jest/globals';
import { DynoDriver } from '../src/classes/dyno-driver';
import { EntityMock } from './mocks/entity.mock';
import { Entity2Mock } from './mocks/entity-2.mock';
import { Entity3Mock } from './mocks/entity-3.mock';
import { normalizeDynamoSchema } from '../src/helpers/schemas/normalize-dynamo-schema';
import { compareSchemas } from '../src/helpers/schemas/compare-schemas';

const DYNO_OPTIONS = {
  tableName: 'test-table',
  endpoint: "http://localhost:8000",
  region: "local",
  metrics: true,
  entities: [EntityMock, Entity2Mock]
};

describe('DynoDriver e2e', () => {

  // ----------------------------------------------------------------

  it('deletes all existing dynamo tables', async () => {
    const dyno = new DynoDriver(DYNO_OPTIONS);
    const namesBefore = await dyno.getDynamoTableNames();
    await dyno.deleteTables(namesBefore);

    const namesAfter = await dyno.getDynamoTableNames();

    expect(namesAfter).toEqual([]);
  });


  // ----------------------------------------------------------------

  it('generates a CREATE migration schema', async () => {
    const dyno = new DynoDriver(DYNO_OPTIONS);
    const schemas = await dyno.exportMigrationSchemas();

    expect(schemas.map(schema => schema.diffStatus))
      .toEqual(['CREATE']);
  });

  // ----------------------------------------------------------------

  it('creates a new table from a migration schema', async () => {
    const dyno = new DynoDriver(DYNO_OPTIONS);
    const schemas = await dyno.exportMigrationSchemas();
    const createTables = schemas
      .filter(schema => schema.diffStatus === 'CREATE')
      .map(schema => schema.modelSchema);

    await dyno.createTables(createTables);
    
    const names = await dyno.getDynamoTableNames();

    expect(names).toEqual(['test-table']);
  });

  // ----------------------------------------------------------------

  it('identifies a migration schema has been created', async () => {
    const dyno = new DynoDriver(DYNO_OPTIONS);
    const schemas = await dyno.exportMigrationSchemas();

    expect(schemas.map(schema => schema.diffStatus))
      .toEqual(['']);
  });

  // ----------------------------------------------------------------

  it('identifies a migration schema has been updated', async () => {
    const dyno = new DynoDriver({
      ...DYNO_OPTIONS,
      entities: [ Entity3Mock ]
    });
    const schemas = await dyno.exportMigrationSchemas();

    expect(
      schemas.map(schema => schema.diffStatus)
    ).toEqual([
      'UPDATE'
    ]);
  });
  
});
