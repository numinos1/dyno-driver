import "reflect-metadata";
import { describe, expect, it } from '@jest/globals';
import { DynoDriver } from '../src/classes/dyno-driver';
import { EntityMock } from './mocks/entity.mock';
import { Entity2Mock } from './mocks/entity-2.mock';

describe('DynoDriver e2e', () => {

  it('gets table definitions', async () => {
    const dyno = new DynoDriver({
      tableName: 'test-table',
      endpoint: "http://localhost:8000",
      region: "local",
    });
    const tables = await dyno.getDbTables();

    expect(tables).toEqual([]);
  });
  
});
