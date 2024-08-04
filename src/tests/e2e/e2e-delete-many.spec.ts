import "reflect-metadata";
import { describe, expect, it } from '@jest/globals';
import { DynoDriver } from '@/classes/dyno-driver';
import { Entity5Mock } from '@/tests/mocks/entity-5.mock';
import { Item5Mock } from "../mocks/entity-5.item";
import { DynoModel } from "@/classes/dyno-model";

describe('deleteMany()', () => {
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
        repoId: 'delete-many',
        docId: `doc-${i}`,
        total: i % 2 ? i : undefined
      }));
    }
    const results = await model.putMany(docs);

    expect(results.cost).toEqual(175);
  });

  // // ----------------------------------------------------------------

  it('delete one document by pk/sk', async () => {
    const docs = [{
      repoId: 'delete-one',
      docId: 'doc-1'
    }, {
      repoId: 'delete-one',
      docId: 'doc-20'
    }, {
      repoId: 'delete-one',
      docId: 'doc-30'
    }];
    const result = await model.deleteMany(docs);

    expect(result.cost).toEqual(6);
    expect(result.batches.length).toEqual(1);
    expect(result.docs).toEqual(docs);
    expect(result.errors).toEqual([]);
    expect(result.deleted.length).toEqual(3);
    expect(result.retries).toEqual(0);
  });

  // ----------------------------------------------------------------
});