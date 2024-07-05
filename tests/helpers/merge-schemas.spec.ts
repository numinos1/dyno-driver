import { copyObject } from '../../src/utils';
import { ModelSchemaMock } from './../mocks/model-schema.mock';
import { describe, expect, it } from '@jest/globals';
import { mergeSchemas } from '../../src/helpers/merge-schemas';
import { TProp, TPropTokens } from '../../src/types';

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

    schema1.tableKeys[0][0].prefix = 'TEST#';
    schema1.tableKeys[1][0].prefix = 'TEST#';

    const schema3 = mergeSchemas([schema1, schema2]);

    expect(schema3).toEqual([schema1]);
  });

   // ----------------------------------------------------------------

   it('meges additive schemas', () => {
    const schema1 = copyObject(ModelSchemaMock);
    const schema2 = copyObject(ModelSchemaMock);

    const extraProp: TProp[] = [
      {
        "name": "userId",
        "alias": "pk2",
        "prefix": "USER#",
        "type": "string",
        "token": TPropTokens.string,
        "isRequired": false,
        "isKey": true,
        "index": 2
      },
      {
        "name": "version",
        "alias": "sk2",
        "type": "string",
        "token": TPropTokens.string,
        "prefix": "",
        "isRequired": false,
        "isKey": true,
        "index": 2
      }
    ];
     
    schema1.tableKeys[0][0].prefix = 'TEST#';
    schema1.tableKeys[1][0].prefix = 'TEST#';
    schema2.tableKeys.push(extraProp);

    const schema3 = mergeSchemas([schema1, schema2]);
     
    const merged = copyObject(schema1);
    merged.tableKeys.push(extraProp);

    expect(schema3).toEqual([merged]);
  });

  // ----------------------------------------------------------------

  it('throws on conflicting billing modes', () => {
    const schema1 = copyObject(ModelSchemaMock);
    const schema2 = copyObject(ModelSchemaMock);

    schema1.tableKeys[0][0].prefix = 'TEST#';
    schema1.tableKeys[1][0].prefix = 'TEST#';
    schema1.billingMode = 'PROVISIONED';

    expect(() => {
      mergeSchemas([schema1, schema2])
    }).toThrow(`Billing Mismatch "PROVISIONED" != "PAY_PER_REQUEST" on table "test-table"`);
  });

  // ----------------------------------------------------------------

  it('throws on conflicting removal policies', () => {
    const schema1 = copyObject(ModelSchemaMock);
    const schema2 = copyObject(ModelSchemaMock);

    schema1.tableKeys[0][0].prefix = 'TEST#';
    schema1.tableKeys[1][0].prefix = 'TEST#';
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

    schema1.tableKeys[0][0].prefix = 'TEST#';
    schema1.tableKeys[1][0].prefix = 'TEST#';
    schema1.tableKeys[0][0].token = TPropTokens.number;

    expect(() => {
      mergeSchemas([schema1, schema2])
    }).toThrow(`Token mismatch "N" !== 'S" on table "test-table" at key[0]`);
  });

  // ----------------------------------------------------------------

  it('throws on an alias mismatch', () => {
    const schema1 = copyObject(ModelSchemaMock);
    const schema2 = copyObject(ModelSchemaMock);

    schema1.tableKeys[0][0].prefix = 'TEST#';
    schema1.tableKeys[1][0].prefix = 'TEST#';
    schema1.tableKeys[0][0].alias = 'test';

    expect(() => {
      mergeSchemas([schema1, schema2])
    }).toThrow(`Alias collision "test" !== 'pk" on table "test-table" at key[0]`);
  });

  // ----------------------------------------------------------------

  it('throws on a misssing prefix', () => {
    const schema1 = copyObject(ModelSchemaMock);
    const schema2 = copyObject(ModelSchemaMock);

    schema1.tableKeys[0][0].prefix = 'TEST#';
    schema1.tableKeys[1][0].prefix = '';

    expect(() => {
      mergeSchemas([schema1, schema2])
    }).toThrow(`Missing prefix on table "test-table" at key[1]`);
  });

});