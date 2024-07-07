import "reflect-metadata";
import { describe, expect, it } from '@jest/globals';
import { DynoDriver } from '../src/classes/dyno-driver';
import { EntityMock } from './mocks/entity.mock';
import { Entity2Mock } from './mocks/entity-2.mock';
import { normalizeDynamoSchema } from '../src/helpers/schemas/normalize-dynamo-schema';
import { compareSchemas } from '../src/helpers/schemas/compare-schemas';

describe('DynoDriver e2e', () => {
  const dyno = new DynoDriver({
    tableName: 'test-table',
    endpoint: "http://localhost:8000",
    region: "local",
    metrics: true,
    entities: [EntityMock, Entity2Mock]
  });

  // ----------------------------------------------------------------

  beforeEach(async () => {
    const names = await dyno.getDynamoTableNames();
    await dyno.deleteTables(names);
  });

  // ----------------------------------------------------------------

  it('generates a CREATE migration schema', async () => {
    const schemas = await dyno.exportMigrationSchemas();

    expect(
      schemas.map(schema => schema.diffStatus)
    ).toEqual([
     'CREATE' 
    ]);
  });

  // ----------------------------------------------------------------

  it('creates a new table from a migration schema', async () => {
    const schemas = await dyno.exportMigrationSchemas();

    await dyno.createTables(
      schemas
        .filter(schema => schema.diffStatus === 'CREATE')
        .map(schema => schema.modelSchema)
    );
    
    const names = await dyno.getDynamoTableNames();

    expect(names).toEqual(['test-table']);
  });
  
});
