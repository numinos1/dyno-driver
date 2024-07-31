import "reflect-metadata";
import { describe, expect, it, jest } from '@jest/globals';
import { DynoDriver } from '@/classes/dyno-driver';
import { Entity5Mock } from '@/tests/mocks/entity-5.mock';
import { Item5Mock } from "../mocks/entity-5.item";
import { DynoModel } from "@/classes/dyno-model";
import { setTimeout } from 'node:timers/promises';

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
});