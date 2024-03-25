import { newPropList } from '../mocks/props.mock';
import { describe, expect, it } from '@jest/globals';
import { toKeys } from '../../src/helpers/to-keys';
import { TPropTokens } from '../../src/types';

describe('toKeys()', () => {

  it('is a function', () => {
    expect(typeof toKeys)
      .toEqual('function');
  });

  // ----------------------------------------------------------------
  //                         Throw Errors
  // ----------------------------------------------------------------

  it('should throw if no keys', () => {
    const props = newPropList();

    expect(() => toKeys([], props)).toThrow("missing keys");
  });

  it('should throw if blank prop name', () => {
    const props = newPropList();

    expect(() => toKeys([['']], props)).toThrow("key[0] missing prop name");
    expect(() => toKeys([['', 'repoId']], props)).toThrow("key[0] missing prop name");
    expect(() => toKeys([['repoId', '']], props)).toThrow("key[0] missing prop name");
  });

  it('should throw if keys are not a prop', () => {
    const props = newPropList();

    expect(() => toKeys([['xxx']], props)).toThrow("key[0] xxx is not a prop");
    expect(() => toKeys([['docs#xxx']], props)).toThrow("key[0] xxx is not a prop");
    expect(() => toKeys([['repoId', 'yyy']], props)).toThrow("key[0] yyy is not a prop");
    expect(() => toKeys([['repoId', 'docs#yyy']], props)).toThrow("key[0] yyy is not a prop");
  });

  // ----------------------------------------------------------------
  //                      Single Keys   
  // ----------------------------------------------------------------

  it('should handle a single key', () => {
    const props = newPropList();
    expect(toKeys([['repoId']], props)).toEqual([['repoId', 'repoId']]);

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
    expect(toKeys([['DOC#repoId']], props)).toEqual([['repoId', 'repoId']]);

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
    expect(toKeys([['repoId', 'DOC#']], props)).toEqual([['repoId', '']]);

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
    expect(toKeys([['DOC#', 'repoId']], props)).toEqual([['', 'repoId']]);

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
    expect(toKeys([['repoId','id']], props)).toEqual([['repoId', 'id']]);

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
    expect(toKeys([['repoId','id'], ['id', 'repoId']], props)).toEqual([['repoId', 'id'], ['id', 'repoId']]);

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
