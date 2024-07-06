import "reflect-metadata";
import { describe, expect, it } from '@jest/globals';
import { DynoDriver } from '../src/classes/dyno-driver';
import { EntityMock } from './mocks/entity.mock';
import { Entity2Mock } from './mocks/entity-2.mock';
import { copyProps, diffObjects } from '../src/utils';
import { normalizeDynamoSchema } from '../src/helpers/to-dynamo-schemas';

describe('DynoDriver e2e', () => {

  it('gets table definitions', async () => {
    const dyno = new DynoDriver({
      tableName: 'test-table',
      endpoint: "http://localhost:8000",
      region: "local",
      metrics: true,
      entities: [EntityMock, Entity2Mock]
    });
    // const tables = await dyno.getDynamoTableSchemas();
    // console.log(JSON.stringify(tables, null, '  '));

    const modelSchemas = dyno.toDynamoSchemas();
    //console.log("-".repeat(70));
    //console.log(JSON.stringify(modelSchemas, null, '  '));

    const dynamoSchemas = await dyno.getDynamoTableSchemas();
    //console.log("-".repeat(70));
    //console.log(JSON.stringify(dynamoSchemas, null, '  '));

    const dynamoCore = Object.values(dynamoSchemas).map(normalizeDynamoSchema);
    // console.log("-".repeat(70));
    // console.log('DYNAMO_CORE', JSON.stringify(dynamoCore, null, '  '));

    const modelCore = modelSchemas.map(normalizeDynamoSchema);
    // console.log("-".repeat(70));
    // console.log('DYNAMO_CORE', JSON.stringify(modelCore, null, '  '));

    for (let i = 0; i < modelCore.length; i++)
    modelCore.forEach((modelSchema => {
      const diffCore = diffObjects(modelCore, dynamoCore);

      console.log("-".repeat(70));
      console.log('SCHEMA', modelSchema.TableName);
      console.log('DIFF', JSON.stringify(diffCore, null, '  '));
    });

    // DELETE TABLES
    //const out = await dyno.deleteTables(Object.keys(dynamoSchemas));

    // const out = await dyno.createTables(dyno.toDynamoSchemas());

    // console.log('OUT', out);

    expect(1).toEqual(1);
  });
  
});
