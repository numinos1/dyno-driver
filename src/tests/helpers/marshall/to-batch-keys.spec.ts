import { Entity5Mock } from '@/tests/mocks/entity-5.mock';
import { toBatchKeys } from '@/helpers/marshall/to-batch-keys';
import { tableIndex } from '@/tests/mocks/entity-5.indices';
import { describe, expect, it } from '@jest/globals';

describe('to-batch-keys()', () => {

  it('is a function', () => {
    expect(typeof toBatchKeys).toEqual('function');
  });

  it('should map all key/index types', () => {
    const result = toBatchKeys<Entity5Mock>(
      [
        { repoId: '123', docId: 'abc1' },
        { alias: 'aaaa' },
        { repoId: '123', docId: 'abc2' },
        { docId: 'abc3' },
        { docId: 'abc4' },
        { repoId: '123', docId: 'abc5' },
        { repoId: '456', total: 10 },
      ],
      tableIndex
    );

    expect(result).toEqual({
      "tableName": {
        Keys: [
          {
            pk: { S: "repo#123" },
            sk: { S: "doc#abc1" }
          },
          {
            pk: { S: "repo#123" },
            sk: { S: "doc#abc2" }
          },
          {
            pk: { S: "repo#123" },
            sk: { S: "doc#abc5" }
          }
        ]
      },
      "tableName-gsi-2": {
        Keys: [
          {
            pk2: { S: 'aaaa' },
            sk2: { S: 'ALIAS#' }
          }
        ]
      },
      "tableName-gsi-1": {
        Keys: [
          {
            pk1: { S: "doc#abc3" },
            sk1: { S: "repo#" }
          },
          {
            pk1: { S: "doc#abc4" },
            sk1: { S: "repo#" }
          }
        ]
      },
      "tableName-gsi-3": {
        Keys: [
          {
            pk3: { S: "repo#456" },
            sk3: { N: "10" }
          }
        ]
      }
    });
  });

});