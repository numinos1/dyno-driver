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
    for (let i = 0; i < 10; i++) {
      docs.push(Item5Mock({
        repoId: 'get-one',
        docId: `doc-${i}`,
        total: i % 2 ? i : undefined
      }));
    }
    const results = await model.putMany(docs);

    expect(results.cost).toEqual(35);
  });

  // ----------------------------------------------------------------

  it('fetches saved docs (non-consistent)', async () => {
    const results = await model.getBatch(
      docs.map(doc => ({
        repoId: doc.repoId,
        docId: doc.docId
      }))
    );

    expect(results.cost).toEqual(5);
    expect(results.docs.length).toEqual(10);
    expect(results.errors).toEqual([]);
    expect(results.retries).toEqual(0);
    expect(results.batches.length).toEqual(1);
  });

  // ----------------------------------------------------------------

  it('fetches saved docs (consistent)', async () => {
    const results = await model.getBatch(
      docs.map(doc => ({
        repoId: doc.repoId,
        docId: doc.docId
      })),
      { consistent: true }
    );

    expect(results.cost).toEqual(10);
    expect(results.docs.length).toEqual(10);
    expect(results.errors).toEqual([]);
    expect(results.retries).toEqual(0);
    expect(results.batches.length).toEqual(1);
  });

  // ----------------------------------------------------------------

  it('fetches docs with small batch size', async () => {
    const results = await model.getBatch(
      docs.map(doc => ({
        repoId: doc.repoId,
        docId: doc.docId
      })),
      { batchSize: 2 }
    );

    expect(results.cost).toEqual(5);
    expect(results.docs.length).toEqual(10);
    expect(results.errors).toEqual([]);
    expect(results.retries).toEqual(0);
    expect(results.batches.length).toEqual(5);
  });

  // ----------------------------------------------------------------

  it(`returns no results when docs aren't found`, async () => {
    const results = await model.getBatch(
      docs.map(doc => ({
        repoId: doc.repoId,
        docId: doc.docId + 'abc'
      }))
    );

    expect(results.cost).toEqual(0);
    expect(results.docs.length).toEqual(0);
    expect(results.errors).toEqual([]);
    expect(results.retries).toEqual(0);
    expect(results.batches.length).toEqual(1);
  });

});
