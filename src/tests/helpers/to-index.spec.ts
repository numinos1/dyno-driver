import { newPropList } from '../mocks/props.mock';
import { describe, expect, it } from '@jest/globals';
import { toIndex } from '@/helpers/to-index';
import { TIndex, TProp, TPropTokens } from '@/types';

/**
 * Helper to convert TIndex to string[][]
 */
function toNames(keys: TIndex[]) {
  return keys.map(key => ({
    pk: key.pk.name,
    sk: key.sk.name
  }));
}

/**
 * Tests
 */
describe('toIndex()', () => {

  it('is a function', () => {
    expect(typeof toIndex)
      .toEqual('function');
  });

  // ----------------------------------------------------------------
  //                         Throw Errors
  // ----------------------------------------------------------------

  it('should throw if no keys', () => {
    const props = newPropList();

    expect(() => toIndex([{ pk: '' }], props)).toThrow("key[0] missing prop name");
  });

  it('should throw if blank prop name', () => {
    const props = newPropList();

    expect(() => toIndex([{ pk: '' }], props)).toThrow("key[0] missing prop name");
    expect(() => toIndex([{ pk: '', sk: 'repoId' }], props)).toThrow("key[0] missing prop name");
    expect(() => toIndex([{ pk: 'repoId', sk: '' }], props)).toThrow("key[0] missing prop name");
  });

  it('should throw if keys are not a prop', () => {
    const props = newPropList();

    expect(() => toIndex([{ pk: 'xxx' }], props)).toThrow("key[0] xxx is not a prop");
    expect(() => toIndex([{ pk: 'docs#xxx' }], props)).toThrow("key[0] xxx is not a prop");
    expect(() => toIndex([{ pk: 'repoId', sk: 'yyy' }], props)).toThrow("key[0] yyy is not a prop");
    expect(() => toIndex([{ pk: 'repoId', sk: 'docs#yyy' }], props)).toThrow("key[0] yyy is not a prop");
  });

  // ----------------------------------------------------------------
  //                      Single Keys   
  // ----------------------------------------------------------------

  it('should handle a single key', () => {
    const props = newPropList();
    expect(toNames(toIndex([{ pk: 'repoId' }], props)))
      .toEqual([{ pk: 'repoId', sk: 'repoId' }]);

    expect(props.find(p => p.name === 'repoId')).toEqual({
      name: 'repoId',
      alias: 'pk',
      prefix: '',
      type: 'string',
      token: TPropTokens.string,
      isRequired: true,
      isKey: true,
      index: 0
    });
    expect(props[props.length - 1]).toEqual({
      name: 'repoId',
      alias: 'sk',
      prefix: '',
      type: 'string',
      token: TPropTokens.string,
      isRequired: true,
      isKey: true,
      index: 0
    });
  });

  it('should handle a single key with a prefix', () => {
    const props = newPropList();
    expect(toNames(toIndex([{ pk: 'DOC#repoId' }], props)))
      .toEqual([{ pk: 'repoId', sk: 'repoId' }]);

    expect(props.find(p => p.name === 'repoId')).toEqual({
      name: 'repoId',
      alias: 'pk',
      prefix: 'DOC#',
      type: 'string',
      token: TPropTokens.string,
      isRequired: true,
      isKey: true,
      index: 0
    });
    expect(props[props.length - 1]).toEqual({
      name: 'repoId',
      alias: 'sk',
      prefix: 'DOC#',
      type: 'string',
      token: TPropTokens.string,
      isRequired: true,
      isKey: true,
      index: 0
    });
  });

  // ----------------------------------------------------------------
  //                       Static Keys
  // ----------------------------------------------------------------

  it('should handle a prop pk with a static sk', () => {
    const props = newPropList();
    expect(toNames(toIndex([{ pk: 'repoId', sk: 'DOC#' }], props)))
      .toEqual([{ pk: 'repoId', sk: '' }]);

    expect(props.find(p => p.name === 'repoId')).toEqual({
      name: 'repoId',
      alias: 'pk',
      prefix: '',
      type: 'string',
      token: TPropTokens.string,
      isRequired: true,
      isKey: true,
      index: 0
    });
    expect(props[props.length - 1]).toEqual({
      name: '',
      alias: 'sk',
      prefix: 'DOC#',
      type: 'string',
      token: TPropTokens.string,
      isRequired: false,
      isKey: true,
      index: 0
    });
  });

  it('should handle a static sk with a prop sk', () => {
    const props = newPropList();
    expect(toNames(toIndex([{ pk: 'DOC#', sk: 'repoId' }], props)))
      .toEqual([{ pk: '', sk: 'repoId' }]);

    expect(props[props.length - 1]).toEqual({
      name: '',
      alias: 'pk',
      prefix: 'DOC#',
      type: 'string',
      token: TPropTokens.string,
      isRequired: false,
      isKey: true,
      index: 0
    });
    expect(props.find(p => p.name === 'repoId')).toEqual({
      name: 'repoId',
      alias: 'sk',
      prefix: '',
      type: 'string',
      token: TPropTokens.string,
      isRequired: true,
      isKey: true,
      index: 0
    });
  });

  // ----------------------------------------------------------------
  //                       Compound Keys
  // ----------------------------------------------------------------

  it('should handle single keys', () => {
    const props = newPropList();
    expect(toNames(toIndex([{ pk: 'repoId', sk: 'id' }], props)))
      .toEqual([{ pk: 'repoId', sk: 'id' }]);

    expect(props.find(p => p.name === 'repoId')).toEqual({
      name: 'repoId',
      alias: 'pk',
      prefix: '',
      type: 'string',
      token: TPropTokens.string,
      isRequired: true,
      isKey: true,
      index: 0
    });
    expect(props.find(p => p.name === 'id')).toEqual({
      name: 'id',
      alias: 'sk',
      prefix: '',
      type: 'string',
      token: TPropTokens.string,
      isRequired: true,
      isKey: true,
      index: 0
    });
  });

  // ----------------------------------------------------------------
  //                       GSI Keys
  // ----------------------------------------------------------------

  it('should handle compound GSI Keys', () => {
    const props = newPropList();
    expect(toNames(toIndex([{ pk: 'repoId', sk: 'id' }, { pk: 'id', sk: 'repoId' }], props)))
      .toEqual([{ pk: 'repoId', sk: 'id' }, { pk: 'id', sk: 'repoId' }]);

    expect(props.find(p => p.name === 'repoId')).toEqual({
      name: 'repoId',
      alias: 'pk',
      prefix: '',
      type: 'string',
      token: TPropTokens.string,
      isRequired: true,
      isKey: true,
      index: 0
    });
    expect(props.find(p => p.name === 'id')).toEqual({
      name: 'id',
      alias: 'sk',
      prefix: '',
      type: 'string',
      token: TPropTokens.string,
      isRequired: true,
      isKey: true,
      index: 0
    });
    expect(props[props.length - 2]).toEqual({
      name: 'id',
      alias: 'pk1',
      prefix: '',
      type: 'string',
      token: TPropTokens.string,
      isRequired: false,
      isKey: true,
      index: 1
    });
    expect(props[props.length - 1]).toEqual({
      name: 'repoId',
      alias: 'sk1',
      prefix: '',
      type: 'string',
      token: TPropTokens.string,
      isRequired: false,
      isKey: true,
      index: 1
    });

  });

});
