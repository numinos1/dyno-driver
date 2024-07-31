import "reflect-metadata";
import { describe, expect, it } from '@jest/globals';
import { DynoDriver } from '@/classes/dyno-driver';
import { Entity5Mock } from '@/tests/mocks/entity-5.mock';
import { Item5Mock } from "../mocks/entity-5.item";
import { DynoModel } from "@/classes/dyno-model";

describe('deleteOne()', () => {
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
        repoId: 'delete-one',
        docId: `doc-${i}`,
        total: i % 2 ? i : undefined
      }));
    }
    const results = await model.putMany(docs);

    expect(results.cost).toEqual(175);
  });

  // ----------------------------------------------------------------

  it('delete one document by pk/sk', async () => {
    const result = await model.deleteOne({
      repoId: 'delete-one',
      docId: 'doc-1'
    });

    expect(result.cost).toEqual(4);
    expect(result.doc).toEqual(docs[1]);

    const result2 = await model.getOne({
      where: {
        repoId: 'delete-one',
        docId: 'doc-1'
      }
    });

    expect(result2.doc).toEqual(undefined);
  });

  // ----------------------------------------------------------------

  it('delete one must have pk/sk', async () => {
    expect(async () => {
      await model.deleteOne({
        repoId: 'delete-one',
      });
    }).rejects.toThrow('The number of conditions on the keys is invalid');
  });

  // ----------------------------------------------------------------

  it('conditional delete one (fail)', async () => {
    expect(async () => {
      await model.deleteOne({
        repoId: 'delete-one',
        docId: 'doc-2',
        isBig: { $eq: true }
      });
    }).rejects.toThrow('The conditional request failed');
  });

  // ----------------------------------------------------------------

  it('conditional delete one (success)', async () => {
    const result = await model.deleteOne({
      repoId: 'delete-one',
      docId: 'doc-2',
      isBig: { $eq: false }
    });

    expect(result.cost).toEqual(3);
    expect(result.doc).toEqual(docs[2]);
  });
});