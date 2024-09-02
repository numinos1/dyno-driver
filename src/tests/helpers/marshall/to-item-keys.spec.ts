import { toItemKeys } from '@/helpers/marshall/to-item-keys';
import { Item5Mock } from '@/tests/mocks/entity-5.item';
import { Entity5Mock } from '@/tests/mocks/entity-5.mock';
import { TIndex, TPropTokens } from '@/types';
import { describe, expect, it } from '@jest/globals';

const index: TIndex = {
  name: 'table-name',
  pk: {
    name: 'repoId',
    alias: 'pk',
    type: TPropTokens.string,
    prefix: 'repo#',
    isRequired: true,
    isStatic: false,
    isKey: true,
    index: 0
  },
  sk: {
    name: 'docId',
    alias: 'sk',
    type: TPropTokens.string,
    prefix: 'doc#',
    isRequired: true,
    isStatic: false,
    isKey: true,
    index: 0
  },
  wcu: 0,
  rcu: 0,
  project: []
};

describe('to-item-keys()', () => {

  it('is a function', () => {
    expect(typeof toItemKeys).toEqual('function');
  });

  it('extracts pk/sk from a document', () => {
    const doc = Item5Mock();
    const result = toItemKeys(doc, index);

    expect(result).toEqual({
      pk: { S: `repo#${doc.repoId}` },
      sk: { S: `doc#${doc.docId}` }
    });
  });

  it('Throws if sk is missing', () => {
    const doc: Partial<Entity5Mock> = Item5Mock();
    delete doc.docId;

    expect(() => toItemKeys(doc, index))
      .toThrow('docId is required');
  });

  it('Throws if pk is missing', () => {
    const doc: Partial<Entity5Mock> = Item5Mock();
    delete doc.repoId;

    expect(() => toItemKeys(doc, index))
      .toThrow('repoId is required');
  });

});