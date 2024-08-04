import "reflect-metadata";
import { describe, expect, it, jest } from '@jest/globals';
import { DynoDriver } from '@/classes/dyno-driver';
import { Entity5Mock } from '@/tests/mocks/entity-5.mock';
import { Item5Mock } from "../mocks/entity-5.item";
import { DynoModel } from "@/classes/dyno-model";

describe('getOne()', () => {
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
  //      Get by different indices
  // ----------------------------------------------------------------

  it('get one by PK/SK (consistent)', async () => {
    const getResult = await model.getOne({
      consistent: true,
      where: {
        repoId: docs[0].repoId,
        docId: docs[0].docId
      }
    });

    expect(getResult.cost).toEqual(1);
    expect(getResult.doc).toEqual(docs[0]);
    expect(getResult.strategy).toEqual('getItem');
    expect(getResult.table).toEqual("mock5-table");
    expect(getResult.index).toEqual(undefined);
  });

  // ----------------------------------------------------------------

  it('get one by PK/SK (not consistent)', async () => {
    const getResult = await model.getOne({
      consistent: false,
      where: {
        repoId: docs[0].repoId,
        docId: docs[0].docId
      }
    });

    expect(getResult.cost).toEqual(0.5);
    expect(getResult.doc).toEqual(docs[0]);
    expect(getResult.strategy).toEqual('getItem');
    expect(getResult.table).toEqual("mock5-table");
    expect(getResult.index).toEqual(undefined);
  });

  // ----------------------------------------------------------------

  it('get one by GSI 1 (skQuery)', async () => {
    const getResult = await model.getOne({
      where: {
        docId: docs[0].docId
      }
    });
    expect(getResult.cost).toEqual(0.5);
    expect(getResult.doc).toEqual(docs[0]);
    expect(getResult.strategy).toEqual('skQuery');
    expect(getResult.table).toEqual("mock5-table");
    expect(getResult.index).toEqual("mock5-table-gsi-1");
  });

  // ----------------------------------------------------------------

  it('get one by GSI 2 (skQuery)', async () => {
    const getResult = await model.getOne({
      where: {
        alias: docs[0].alias
      }
    });

    expect(getResult.cost).toEqual(0.5);
    expect(getResult.doc).toEqual(docs[0]);
    expect(getResult.strategy).toEqual('skQuery');
    expect(getResult.table).toEqual("mock5-table");
    expect(getResult.index).toEqual("mock5-table-gsi-2");
  });

   // ----------------------------------------------------------------

   it('get one by GSI 3 (skQuery)', async () => {
    const getResult = await model.getOne({
      where: {
        repoId: docs[1].repoId,
        total: docs[1].total
      }
    });

    expect(getResult.cost).toEqual(0.5);
    expect(getResult.doc).toEqual(docs[1]);
    expect(getResult.strategy).toEqual('skQuery');
    expect(getResult.table).toEqual("mock5-table");
    expect(getResult.index).toEqual("mock5-table-gsi-3");
  });

  // ----------------------------------------------------------------

  it('get one should throw if consistency = true', async () => {
    expect(async () => {
      await model.getOne({
        consistent: true,
        where: {
          docId: docs[0].docId
        }
      });
    }).rejects.toThrow(
      'Consistent read cannot be true when querying a GSI'
    );
  });

  // ----------------------------------------------------------------

  it('get one PK/SK query should ignore filtered query params', async () => {
    const getResult = await model.getOne({
      where: {
        repoId: docs[0].repoId,
        docId: docs[0].docId,
        ages: { $contains: 2 }
      }
    });

    expect(getResult.cost).toEqual(0.5);
    expect(getResult.doc).toEqual(docs[0]);
    expect(getResult.strategy).toEqual('getItem');
    expect(getResult.table).toEqual("mock5-table");
    expect(getResult.index).toEqual(undefined);
  });

});
