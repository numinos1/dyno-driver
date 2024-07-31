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

  it('put many documents', async () => {
    for (let i = 0; i < 150; i++) {
      docs.push(Item5Mock({
        repoId: 'delete-many',
        docId: `doc-${i}`,
        total: i % 2 ? i : undefined
      }));
    }
    const results = await model.putMany(docs);

    expect(results.cost).toEqual(525);
    expect(results.batches.length).toEqual(6);
    expect(results.docs).toEqual(docs);
    expect(results.errors).toEqual([]);
    expect(results.saved.length).toEqual(150);
    expect(results.retries).toEqual(0);
  });

});