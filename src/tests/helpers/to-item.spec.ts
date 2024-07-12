import { describe, expect, it } from '@jest/globals';
import { toItem } from '@/helpers/marshall/to-item';
import { EntityMock } from '@/tests/mocks/entity.mock';
import { propList } from '@/tests/mocks/props.mock';

describe('toItem()', () => {

  it('is a function', () => {
    expect(typeof toItem)
      .toEqual('function');
  });

  // ----------------------------------------------------------------

  it('', () => {
    expect(toItem<EntityMock>({
      id: '1245',
      repoId: 'abcd',
      version: 'abcd1234',
      encoding: 'json',
      status: 'active',
      createdBy: '1234abcd',
      createdOn: 1234,
      updatedBy: '1234abcd',
      updatedOn: 1234,
      body: Buffer.from('xxxx')
    }, propList)).toEqual({
      cby: { S: '1234abcd' },
      con: { N: "1234" },
      enc: { S: 'json' },
      pk: { S: 'REPO#abcd' },
      sk: { S: 'DOC#1245' },
      sta: { S: 'active' },
      uby: { S: '1234abcd' },
      uon: { N: "1234" },
      vid: { S: 'abcd1234' },
      bdy: { B: Buffer.from('xxxx') }
    });
  });

  // ----------------------------------------------------------------
});
