import "reflect-metadata";
import { describe, expect, it, jest } from '@jest/globals';
import { DynoDriver } from '@/classes/dyno-driver';
import { Entity5Mock } from '@/tests/mocks/entity-5.mock';
import { Item5Mock } from "../mocks/entity-5.item";
import { DynoModel } from "@/classes/dyno-model";

// ------------------------------------------------------------------
//      Fixtures
// ------------------------------------------------------------------

const DOC_UPDATE: Entity5Mock = {
  repoId: 'update-one',
  docId: 'doc-0',
  alias: 'NEW-ALIAS',
  total: 1111,
  isBig: true,
  ages: [4],
  names: ['NAME'],
  list: [1, 'a'],
  colors: new Set<string>(['black']),
  years: new Set<number>([2222]),
  meta: { hello: 'world' },
  meta2: { year: 2024 },
  body: Buffer.from('XXXXXX', 'utf8'),
};

// ------------------------------------------------------------------
//      Tests
// ------------------------------------------------------------------

describe('updateOne()', () => {
  let dyno: DynoDriver;
  let model: DynoModel<Entity5Mock>;
  let docs: Entity5Mock[] = [];

  // ----------------------------------------------------------------
  //        Testing Setup
  // ----------------------------------------------------------------

  beforeAll(async () => {
    dyno = new DynoDriver({
      tableName: 'mock5-table',
      endpoint: "http://localhost:8000",
      region: "local",
      metrics: true,
      entities: [Entity5Mock],
    });

    await dyno.resetTables();

    model = dyno.model(Entity5Mock);

    for (let i = 0; i < 10; i++) {
      docs.push(Item5Mock({
        repoId: 'update-one',
        docId: `doc-${i}`,
        total: i
      }));
    }
    await model.putMany(docs);
  });

  // ----------------------------------------------------------------
  //        Return Types
  // ----------------------------------------------------------------

  describe('return types', () => {

    it('returns NONE props', async () => {
      const { repoId, docId } = DOC_UPDATE;
    
      const result = await model.updateOne(
        { repoId, docId },
        {
          $set: {
            total: 2222,
            alias: '2-ALIAS'
          }
        },
        { returns: 'NONE' }
      );
      expect(result.doc).toEqual(undefined);
    });

    // ------------------------------------------------

    it('returns ALL_NEW props', async () => {
      const { repoId, docId } = DOC_UPDATE;
    
      const result = await model.updateOne(
        { repoId, docId },
        {
          $set: {
            total: 3333,
            alias: '3-ALIAS'
          }
        },
        { returns: 'ALL_NEW' }
      );
      expect(result.doc).toEqual({
        ...docs[0],
        total: 3333,
        alias: '3-ALIAS'
      });
    });

    // ------------------------------------------------

    it('returns ALL_OLD props', async () => {
      const { repoId, docId } = DOC_UPDATE;
    
      const result = await model.updateOne(
        { repoId, docId },
        {
          $set: {
            total: 4444,
            alias: '4-ALIAS'
          }
        },
        { returns: 'ALL_OLD' }
      );
      expect(result.doc).toEqual({
        ...docs[0],
        total: 3333,
        alias: '3-ALIAS'
      });
    });

    // ------------------------------------------------

    it('returns UPDATED_NEW props', async () => {
      const { repoId, docId } = DOC_UPDATE;
    
      const result = await model.updateOne(
        { repoId, docId },
        {
          $set: {
            total: 5555,
            alias: '5-ALIAS'
          }
        },
        { returns: 'UPDATED_NEW' }
      );
      expect(result.doc).toEqual({
        total: 5555,
        alias: '5-ALIAS'
      });
    });

    // ------------------------------------------------

    it('returns UPDATED_OLD props', async () => {
      const { repoId, docId } = DOC_UPDATE;
    
      const result = await model.updateOne(
        { repoId, docId },
        {
          $set: {
            total: 6666,
            alias: '6-ALIAS'
          }
        },
        { returns: 'UPDATED_OLD' }
      );
      expect(result.doc).toEqual({
        total: 5555,
        alias: '5-ALIAS'
      });
    });

  });

  // ----------------------------------------------------------------

  describe('clause types', () => {

    it('updates $set props', async () => {
      const { repoId, docId, ...updates } = DOC_UPDATE;
    
      const result = await model.updateOne(
        { repoId, docId },
        { $set: updates }
      );
      expect(result.cost).toEqual(6);
      expect(result.doc).toEqual(DOC_UPDATE);
      expect(result.duration).toEqual(expect.any(Number));
    });

    // ------------------------------------------------

    it('updates $unset props', async () => {
      const { doc } = await model.updateOne(
        {
          repoId: 'update-one',
          docId: 'doc-1',
        },
        {
          $unset: {
            total: '',
            isBig: '',
          }
        }
      );
      expect(doc.total).toBeUndefined();
      expect(doc.isBig).toBeUndefined();
    });

    // ------------------------------------------------

    it('updates $create props', async () => {
      const { doc } = await model.updateOne(
        {
          repoId: 'update-one',
          docId: 'doc-1',
        },
        {
          $create: {
            total: 5555,
            isBig: false,
            alias: 'NO-UPDATE'
          }
        }
      );
      expect(doc.total).toEqual(5555);
      expect(doc.isBig).toEqual(false);
      expect(doc.alias).toEqual(docs[1].alias);
    });

    // ------------------------------------------------

    it('updates $create props', async () => {
      const { doc } = await model.updateOne(
        {
          repoId: 'update-one',
          docId: 'doc-1',
        },
        {
          $create: {
            total: 5555,
            isBig: false,
            alias: 'NO-UPDATE'
          }
        }
      );
      expect(doc.total).toEqual(5555);
      expect(doc.isBig).toEqual(false);
      expect(doc.alias).toEqual(docs[1].alias);
    });

    // ------------------------------------------------

    it('updates $setPath props', async () => {
      const { doc } = await model.updateOne(
        {
          repoId: 'update-one',
          docId: 'doc-1',
        },
        {
          $setPath: {
            meta: {
              'stuff': 'Bazinga!'
            }
          }
        }
      );
      expect(doc.meta).toEqual({ stuff: 'Bazinga!' });
    });

    // ------------------------------------------------

    it('updates $unsetPath props', async () => {
      const { doc } = await model.updateOne(
        {
          repoId: 'update-one',
          docId: 'doc-1',
        },
        {
          $unsetPath: {
            meta: {
              'stuff': true
            }
          }
        }
      );
      expect(doc.meta).toEqual({});
    });

    // ------------------------------------------------

    it('updates $setIndex props', async () => {
      const { doc } = await model.updateOne(
        {
          repoId: 'update-one',
          docId: 'doc-1',
        },
        {
          $setIndex: {
            ages: {
              1: 1000
            }
          }
        }
      );
      expect(doc.ages.length).toEqual(3);
      expect(doc.ages[1]).toEqual(1000);
    });

    // ------------------------------------------------

    it('updates $unsetIndex props', async () => {
      const { doc } = await model.updateOne(
        {
          repoId: 'update-one',
          docId: 'doc-1',
        },
        {
          $unsetIndex: {
            ages: {
              1: true
            }
          }
        }
      );
      expect(doc.ages.length).toEqual(2);
    });

    // ------------------------------------------------

    it('updates $append props', async () => {
      const { doc } = await model.updateOne(
        {
          repoId: 'update-one',
          docId: 'doc-2',
        },
        {
          $append: {
            ages: 13
          }
        }
      );
      expect(doc.ages.length).toEqual(4);
      expect(doc.ages[3]).toEqual(13);
    });

    // ------------------------------------------------

    it('updates $prepend props', async () => {
      const { doc } = await model.updateOne(
        {
          repoId: 'update-one',
          docId: 'doc-2',
        },
        {
          $prepend: {
            ages: [11,12,13]
          }
        }
      );
      expect(doc.ages.length).toEqual(7);
      expect(doc.ages.slice(0, 3)).toEqual([11, 12, 13]);
    });

    // ------------------------------------------------

    it('updates $increment props', async () => {
      const { doc } = await model.updateOne(
        {
          repoId: 'update-one',
          docId: 'doc-3',
        },
        {
          $increment: {
            total: 100
          }
        }
      );
      expect(doc.total).toEqual(docs[3].total + 100);
    });

    // ------------------------------------------------

    it('updates $decrement props', async () => {
      const { doc } = await model.updateOne(
        {
          repoId: 'update-one',
          docId: 'doc-4',
        },
        {
          $decrement: {
            total: 100
          }
        }
      );
      expect(doc.total).toEqual(docs[4].total - 100);
    });

    // ------------------------------------------------

    it('updates $add props', async () => {
      const { doc } = await model.updateOne(
        {
          repoId: 'update-one',
          docId: 'doc-4',
        },
        {
          $add: {
            colors: new Set(['beige', 'tan'])
          }
        }
      );
      expect(doc.colors).toEqual(new Set([
        "beige",
        "blue",
        "green",
        "red",
        "tan",
      ]));
    });

    // ------------------------------------------------

    it('updates $delete props', async () => {
      const { doc } = await model.updateOne(
        {
          repoId: 'update-one',
          docId: 'doc-5',
        },
        {
          $delete: {
            colors: new Set(['blue'])
          }
        }
      );
      expect(doc.colors).toEqual(new Set([
        'green',
        'red'
      ]));
    });

  });

  // ----------------------------------------------------------------
  //        Conditional Checks
  // ----------------------------------------------------------------

  describe('conditional checks', () => {

    it('condtionally throws', async () => {
      const { repoId, docId, ...updates } = DOC_UPDATE;
    
      expect(() => model.updateOne(
        {
          repoId: 'update-one',
          docId: 'doc-6'
        },
        {
          $set: {
            alias: 'NEW-ALIAS'
          }
        },
        {
          where: {
            total: { $eq: 5 }
          }
        }
      )).rejects.toThrow('The conditional request failed');
    });

    it('condtionally updates', async () => {
      const { repoId, docId, ...updates } = DOC_UPDATE;
    
      const result = await model.updateOne(
        {
          repoId: 'update-one',
          docId: 'doc-6'
        },
        {
          $set: {
            alias: 'NEW-ALIAS'
          }
        },
        {
          where: {
            total: { $eq: 6 }
          }
        }
      );
      expect(result.doc.alias).toEqual('NEW-ALIAS');
    });

  });

});