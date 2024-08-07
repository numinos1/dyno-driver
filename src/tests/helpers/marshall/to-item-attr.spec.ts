import { toItemAttr } from '@/helpers/marshall/to-item-attr';
import { TPropTokens } from '@/types';
import { describe, expect, it } from '@jest/globals';

describe('to-item-keys()', () => {

  it('is a function', () => {
    expect(typeof toItemAttr).toEqual('function');
  });

  it('translates strings', () => {
    expect(toItemAttr('hello', TPropTokens.string))
      .toEqual({ S: 'hello' });
  });

  it('adds prefix to strings', () => {
    expect(toItemAttr('hello', TPropTokens.string, 'docId#'))
      .toEqual({ S: 'docId#hello' });
  });

  it('translates numbers', () => {
    expect(toItemAttr(1234, TPropTokens.number))
      .toEqual({ N: '1234' });
  });

  it('adds prefix to numbers', () => {
    expect(toItemAttr(1234, TPropTokens.number, 'repo#'))
      .toEqual({ N: 'repo#1234' });
  });

  it('translates booleans', () => {
    expect(toItemAttr(true, TPropTokens.boolean))
      .toEqual({ BOOL: true });
  });

  it('translates binary buffers', () => {
    expect(toItemAttr(Buffer.from('abc'), TPropTokens.binary))
      .toEqual({ B: new Uint8Array(Buffer.from('abc')) });
  });

  it('translates string sets', () => {
    expect(toItemAttr(new Set(['a','b','c']), TPropTokens.stringSet))
      .toEqual({
        SS: ['a','b','c']
       });
  });

  it('translates number sets (from string-set)', () => {
    expect(toItemAttr(new Set([1, 2, 3]), TPropTokens.stringSet))
      .toEqual({
        NS: ['1', '2', '3']
      });
  });

  it('translates number sets (from number-set)', () => {
    expect(toItemAttr(new Set([1,2,3]), TPropTokens.numberSet))
      .toEqual({
        NS: ['1','2','3']
       });
  });

  it('translates binary sets (from string-set)', () => {
    expect(toItemAttr(new Set([Buffer.from('a')]), TPropTokens.stringSet))
      .toEqual({
        BS: [Buffer.from('a')]
      });
  });

  it('translates binary sets (from binary-set)', () => {
      expect(toItemAttr(new Set([Buffer.from('a')]), TPropTokens.binarySet))
      .toEqual({
        BS: [Buffer.from('a')]
      });
  });

  it('translates lists (empty)', () => {
    expect(toItemAttr([], TPropTokens.list))
      .toEqual({
        L: []
       });
  });

  it('translates lists (various types)', () => {
    expect(toItemAttr([
      'hello',
      1234,
      0,
      Buffer.from('abc'),
      true,
      false,
      null,
      undefined,
      { a: 1 },
      new Set([1, 2, 3]),
      new Set(['a','b','c'])
    ], TPropTokens.list))
      .toEqual({
        L: [
          { S: 'hello' },
          { N: '1234' },
          { N: '0' },
          { B: new Uint8Array(Buffer.from('abc')) },
          { BOOL: true },
          { BOOL: false },
          { NULL: true },
          undefined,
          {
            M: {
              a: { N: '1' }
            }
          },
          { NS: ['1', '2', '3'] },
          { SS: ['a', 'b', 'c'] },
        ]
       });
  });
});