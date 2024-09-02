import { copyObject } from '@/utils';
import { ModelSchemaMock } from '@/tests/mocks/model-schema.mock';
import { describe, expect, it } from '@jest/globals';
import { mergeSchemas } from '@/helpers/schemas/merge-schemas';
import { TIndex, TProp, TPropTokens } from '@/types';

describe('mergeSchemas()', () => {

  // ----------------------------------------------------------------

  it('is a function', () => {
    expect(typeof mergeSchemas)
      .toEqual('function');
  });

  // ----------------------------------------------------------------

  it('merges two non-conflicting schemas', () => {
    const schema1 = copyObject(ModelSchemaMock);
    const schema2 = copyObject(ModelSchemaMock);

    schema1.tableIndex[0].pk.prefix = 'TEST#';
    schema1.tableIndex[1].pk.prefix = 'TEST#';

    const schema3 = mergeSchemas([schema1, schema2]);

    expect(schema3).toEqual([schema1]);
  });

   // ----------------------------------------------------------------

   it('meges additive schemas', () => {
    const schema1 = copyObject(ModelSchemaMock);
    const schema2 = copyObject(ModelSchemaMock);

     const extraProp: TIndex = {
      name: 'table-name',
       wcu: 0,
       rcu: 0,
       project: [],
       pk: {
         "name": "userId",
         "alias": "pk2",
         "prefix": "USER#",
         "type": TPropTokens.string,
         "isRequired": false,
         "isStatic": false,
         "isKey": true,
         "index": 2
       },
       sk: {
         "name": "version",
         "alias": "sk2",
         "type": TPropTokens.string,
         "prefix": "",
         "isRequired": false,
         "isStatic": false,
         "isKey": true,
         "index": 2
       }
     };
     
    schema1.tableIndex[0].pk.prefix = 'TEST#';
    schema1.tableIndex[1].pk.prefix = 'TEST#';
    schema2.tableIndex.push(extraProp);

    const schema3 = mergeSchemas([schema1, schema2]);
     
    const merged = copyObject(schema1);
    merged.tableIndex.push(extraProp);

    expect(schema3).toEqual([merged]);
  });

  // ----------------------------------------------------------------

  it('throws on conflicting wcu', () => {
    const schema1 = copyObject(ModelSchemaMock);
    const schema2 = copyObject(ModelSchemaMock);

    schema1.tableIndex[0].pk.prefix = 'TEST#';
    schema1.tableIndex[1].pk.prefix = 'TEST#';
    schema1.tableIndex[0].wcu = 10;

    expect(() => {
      mergeSchemas([schema1, schema2])
    }).toThrow(`WCU mismatch 10 !== 0 on table "test-table" at key[0]`);
  });

  // ----------------------------------------------------------------

  it('throws on conflicting rcu', () => {
    const schema1 = copyObject(ModelSchemaMock);
    const schema2 = copyObject(ModelSchemaMock);

    schema1.tableIndex[0].pk.prefix = 'TEST#';
    schema1.tableIndex[1].pk.prefix = 'TEST#';
    schema1.tableIndex[0].rcu = 10;

    expect(() => {
      mergeSchemas([schema1, schema2])
    }).toThrow(`RCU mismatch 10 !== 0 on table "test-table" at key[0]`);
  });

  // ----------------------------------------------------------------

  it('throws on conflicting projection', () => {
    const schema1 = copyObject(ModelSchemaMock);
    const schema2 = copyObject(ModelSchemaMock);

    schema1.tableIndex[0].pk.prefix = 'TEST#';
    schema1.tableIndex[1].pk.prefix = 'TEST#';
    schema1.tableIndex[0].project = ['repoId', 'version'];

    expect(() => {
      mergeSchemas([schema1, schema2])
    }).toThrow(`Project mismatched property "repoId" on table "test-table" at key[0]`);
  });

  // ----------------------------------------------------------------

  it('throws on conflicting removal policies', () => {
    const schema1 = copyObject(ModelSchemaMock);
    const schema2 = copyObject(ModelSchemaMock);

    schema1.tableIndex[0].pk.prefix = 'TEST#';
    schema1.tableIndex[1].pk.prefix = 'TEST#';
    schema1.removalPolicy = 'retain';

    expect(() => {
      mergeSchemas([schema1, schema2])
    }).toThrow(`Removal Policy Mismatch "retain" != "destroy" on table "test-table`);
  });

  // ----------------------------------------------------------------

  it('throws on a conflicting prefix', () => {
    const schema1 = copyObject(ModelSchemaMock);
    const schema2 = copyObject(ModelSchemaMock);

    expect(() => {
      mergeSchemas([schema1, schema2])
    }).toThrow(`Prefix collision "DOC#" === 'DOC#" on table "test-table" at key[0]`);
  });

  // ----------------------------------------------------------------

  it('throws on a token mismatch', () => {
    const schema1 = copyObject(ModelSchemaMock);
    const schema2 = copyObject(ModelSchemaMock);

    schema1.tableIndex[0].pk.prefix = 'TEST#';
    schema1.tableIndex[1].pk.prefix = 'TEST#';
    schema1.tableIndex[0].pk.type = TPropTokens.number;

    expect(() => {
      mergeSchemas([schema1, schema2])
    }).toThrow(`Token mismatch "N" !== 'S" on table "test-table" at key[0]`);
  });

  // ----------------------------------------------------------------

  it('throws on an alias mismatch', () => {
    const schema1 = copyObject(ModelSchemaMock);
    const schema2 = copyObject(ModelSchemaMock);

    schema1.tableIndex[0].pk.prefix = 'TEST#';
    schema1.tableIndex[1].pk.prefix = 'TEST#';
    schema1.tableIndex[0].pk.alias = 'test';

    expect(() => {
      mergeSchemas([schema1, schema2])
    }).toThrow(`Alias collision "test" !== 'pk" on table "test-table" at key[0]`);
  });

  // ----------------------------------------------------------------

  it('throws on a misssing prefix', () => {
    const schema1 = copyObject(ModelSchemaMock);
    const schema2 = copyObject(ModelSchemaMock);

    schema1.tableIndex[0].pk.prefix = 'TEST#';
    schema1.tableIndex[1].pk.prefix = '';

    expect(() => {
      mergeSchemas([schema1, schema2])
    }).toThrow(`Missing prefix on table "test-table" at key[1]`);
  });

});