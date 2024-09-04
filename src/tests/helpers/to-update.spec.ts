import { props5Mock } from '../mocks/entity-5.props';
import { describe, expect, it } from '@jest/globals';
import { toUpdate } from '@/helpers/to-update';
import { Entity5Mock } from '@/tests/mocks/entity-5.mock';

describe('toUpdate()', () => {

  it('is a function', () => {
    expect(typeof toUpdate)
      .toEqual('function');
  });

  // ----------------------------------------------------------------

  it('empty query', () => {
    const names = {}, values = {};
    const expr = toUpdate<Entity5Mock>(
      {},
      props5Mock,
      names,
      values
    );

    expect(expr).toEqual('');
    expect(names).toEqual({});
    expect(values).toEqual({});
  });

  // ----------------------------------------------------------------
  
  it('creates a SET expression, names, and values for all entity props',() => {
    const names = {}, values = {};
    const expr = toUpdate<Entity5Mock>(
      {
        $set: {
          repoId: 'REPO_ID',
          docId: 'DOC_ID',
          isBig: true,
          alias: 'ALIAS',
          total: 1,
          ages: [1, 2, 3],
          names: ['a','b','c'],
          list: [1, 'a', true],
          colors: new Set(['a', 'b', 'c']),
          years: new Set([1, 2, 3]),
          deleteOn: 12345,
          meta: { count: 1, name: 'john' },
          meta2: { a: 1, b: 2 },
          body: Buffer.from('abcdefg', 'utf-8')
        }
      },
      props5Mock,
      names,
      values
    );

    expect(expr).toEqual('SET #pk = :v1, #sk = :v2, #isBig = :v3, '
      + '#alias = :v4, #total = :v5, #ages = :v6, '
      + '#names = :v7, #list = :v8, #colors = :v9, '
      + '#years = :v10, #deleteOn = :v11, #meta = :v12, '
      + '#meta2 = :v13, #body = :v14'
    );
    expect(names).toEqual({
      "#ages": "ages",
      "#alias": "alias",
      "#body": "body",
      "#colors": "colors",
      "#deleteOn": "deleteOn",
      "#isBig": "isBig",
      "#list": "list",
      "#meta": "meta",
      "#meta2": "meta2",
      "#names": "names",
      "#pk": "pk",
      "#sk": "sk",
      "#total": "total",
      "#years": "years",
    });
    expect(values).toEqual({
      ":v1": { "S": "REPO_ID" },
      ":v10": { "NS": ["1", "2", "3"] },
      ":v11": { "N": "12345" },
      ":v12": { "M": {
          "count": {
            "N": "1",
          },
          "name": {
            "S": "john",
          },
        },
      },
      ":v13": {
        "M": {
          "a": {
            "N": "1",
          },
          "b": {
            "N": "2",
          },
        },
      },
      ":v14": {
        "B": Buffer.from('abcdefg', 'utf-8')
      },
      ":v2": { "S": "DOC_ID" },
      ":v3": { "BOOL": true },
      ":v4": { "S": "ALIAS" },
      ":v5": { "N": "1" },
      ":v6": {
        "L": [
          { "N": "1" },
          { "N": "2" },
          { "N": "3" },
        ],
      },
      ":v7": {
        "L": [
          { "S": "a" },
          { "S": "b" },
          { "S": "c" },
        ],
      },
      ":v8": {
        "L": [
          { "N": "1" },
          { "S": "a" },
          { "BOOL": true },
        ],
      },
      ":v9": {
        "SS": ["a", "b", "c"],
      },
    });
  });

  // ----------------------------------------------------------------

  it('renders mixed clauses', () => {
    const names = {}, values = {};
    const expr = toUpdate<Entity5Mock>(
      {
        $create: {
          repoId: 'REPO_ID'
        },
        $set: {
          docId: 'DOC_ID'
        },
        $unset: {
          isBig: ''
        },
        $setPath: {
          meta: {
            path: 'path.newprop',
            value: 100
          }
        },
        $unsetPath: {
          meta: 'path.delprop'
        },
        $setIndex: {
          ages: {
            index: 1,
            value: 10
          }
        },
        $unsetIndex: {
          ages: 2
        },
        $append: {
          names: ['a','b','c']
        },
        $prepend: {
          names: ['d','e']
        },
        $increment: {
          total: 10
        },
        $decrement: {
          total: 10
        },
        $add: {
          years: [4,5,6]
        },
        $delete: {
          years: [1, 2]
        }
      },
      props5Mock,
      names,
      values
    );

    expect(expr).toEqual("SET #pk = if_not_exists(#pk, :v1), "
      + "#sk = :v2, #meta.path.newprop = :v3, "
      + "#ages[1] = :v4, #names = list_append(#names, :v5), "
      + "#names = list_append(:v6, #names), "
      + "#total = #total + :v7, #total = #total - :v8 "
      + "REMOVE #isBig ADD #years :v9 "
      + "DELETE #meta.undefined, #ages[undefined], "
      + "#years :v10"
    );
  });

});
