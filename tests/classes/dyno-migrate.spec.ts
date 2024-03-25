import "reflect-metadata";
import { describe, expect, it } from '@jest/globals';
import { DynoMigrate } from '../../src/classes/dyno-migrate';
import { DynoDriver } from '../../src/classes/dyno-driver';
import { EntityMock } from '../mocks/entity.mock';

describe('DynoMigrate()', () => {

  // ------------------------------------------------------

  it('is a constructor', () => {
    expect(typeof DynoMigrate)
      .toEqual('function');
  });

  it('constructs', () => {
    const dyno = new DynoDriver({
      tableName: 'dyno-test',
      endpoint: "http://localhost:8000",
      region: "local",
      entities: [EntityMock]
    });
    const migrate = new DynoMigrate(dyno);

    expect(migrate)
      .toEqual({});
  });

});
