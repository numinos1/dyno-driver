import "reflect-metadata";
import { describe, expect, it, jest } from '@jest/globals';
import { DynoDriver } from '@/classes/dyno-driver';
import { Entity5Mock } from '@/tests/mocks/entity-5.mock';
import { Item5Mock } from "../mocks/entity-5.item";
import { DynoModel } from "@/classes/dyno-model";
import { setTimeout } from 'node:timers/promises';

describe('getMany()', () => {
  let dyno: DynoDriver;
  let model: DynoModel<Entity5Mock>;
  let docs: Entity5Mock[] = [];

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
  });

  // ----------------------------------------------------------------

  it('prime with a series of documents', async () => {
    for (let i = 0; i < 50; i++) {
      docs.push(Item5Mock({
        repoId: 'get-one',
        docId: `doc-${i}`,
        total: i % 2 ? i : undefined
      }));
    }
    const results = await model.putMany(docs);

    expect(results.cost).toEqual(175);
  });

  // ----------------------------------------------------------------

  it('get many with constraint on PK', async () => {
    const result = await model.getMany({
      where: {
        repoId: 'get-one',
      }
    });

    expect(result.cost).toEqual(2.5);
    expect(result.docs.length).toEqual(50);
    expect(result.strategy).toEqual('pkQuery')
    expect(result.table).toEqual('mock5-table');
    expect(result.index).toEqual(undefined);
  });

  // ----------------------------------------------------------------

  it('get many with constraint on PK/SK (filter)', async () => {
    const result = await model.getMany({
      where: {
        repoId: 'get-one',
        docId: {
          $between: ['doc-10', 'doc-20']
        }
      }
    });

    expect(result.cost).toEqual(1);
    expect(result.docs.length).toEqual(12);
    expect(result.strategy).toEqual('skQuery');
    expect(result.table).toEqual('mock5-table');
    expect(result.index).toEqual(undefined);
  });

  // ----------------------------------------------------------------

  it('get many with constraint on GSI 1 PK (static SK)', async () => {
    const result = await model.getMany({
      where: {
        docId: 'doc-10'
      }
    });

    expect(result.cost).toEqual(0.5);
    expect(result.docs.length).toEqual(1);
    expect(result.strategy).toEqual('skQuery');
    expect(result.table).toEqual('mock5-table');
    expect(result.index).toEqual('mock5-table-gsi-1');
  });

  // ----------------------------------------------------------------

  it('get many with constraint on GSI-1 PK (filter SK)', async () => {
    const result = await model.getMany({
      where: {
        docId: 'doc-10',
        repoId: { $eq: 'get-one' }
      }
    });

    expect(result.cost).toEqual(0.5);
    expect(result.docs.length).toEqual(1);
    expect(result.strategy).toEqual('skQuery');
    expect(result.table).toEqual('mock5-table');
    expect(result.index).toEqual('mock5-table-gsi-1');
  });

  // ----------------------------------------------------------------

  it('get many with constraint on GSI 2 PK (static SK)', async () => {
    const result = await model.getMany({
      where: {
        alias: docs[0].alias
      }
    });

    expect(result.cost).toEqual(0.5);
    expect(result.docs.length).toEqual(1);
    expect(result.strategy).toEqual('skQuery');
    expect(result.table).toEqual('mock5-table');
    expect(result.index).toEqual('mock5-table-gsi-2');
  });

  // ----------------------------------------------------------------

  it('get many with constraint on GSI 3 PK/SK', async () => {
    const result = await model.getMany({
      where: {
        repoId: 'get-one',
        total: { $ge: 10 }
      }
    });

    expect(result.cost).toEqual(1);
    expect(result.docs.length).toEqual(20);
    expect(result.strategy).toEqual('skQuery');
    expect(result.table).toEqual('mock5-table');
    expect(result.index).toEqual('mock5-table-gsi-3');
  });

});