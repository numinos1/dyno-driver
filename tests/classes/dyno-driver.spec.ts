import "reflect-metadata";
import { describe, expect, it } from '@jest/globals';
import { DynoDriver } from '../../src/classes/dyno-driver';
import { EntityMock } from '../mocks/entity.mock';
import { Entity2Mock } from '../mocks/entity-2.mock';

describe('DynoDriver()', () => {

  // ------------------------------------------------------

  it('is a constructor', () => {
    expect(typeof DynoDriver)
      .toEqual('function');
  });

  // ------------------------------------------------------

  it('constructs without entities', () => {
    const drive = new DynoDriver({
      tableName: 'test-table',
      endpoint: "http://localhost:8000",
      region: "local",
      metrics: true
    });

    expect(drive.toCdkTables()).toEqual([]);
  });

  // ------------------------------------------------------

  it('constructs with an entity', () => {
    const drive = new DynoDriver({
      tableName: 'test-table',
      metrics: true,
      entities: [EntityMock]
    });

    expect(drive.toCdkTables()).toEqual([{
      table: {
        tableName: "test-table",
        removalPolicy: "destroy",
        billingMode: "PAY_PER_REQUEST",
        partitionKey: {
          name: "pk",
          type: "S"
        },
        sortKey: {
          name: "sk",
          type: "S"
        },
        timeToLiveAttribute: "ttl",
      },
      indices: [{
        indexName: "test-table-gsi-1",
        projectionType: "ALL",
        partitionKey: {
          name: "pk1",
          type: "S",
        },
        sortKey: {
          name: "sk1",
          type: "S",
        }
      }]
    }]);
  });

  // ------------------------------------------------------

  it('constructs with an entity', () => {
    const drive = new DynoDriver({
      tableName: 'test-table',
      metrics: true,
      entities: [EntityMock, Entity2Mock]
    });

    expect(drive.toCdkTables()).toEqual([{
      table: {
        tableName: "test-table",
        removalPolicy: "destroy",
        billingMode: "PAY_PER_REQUEST",
        partitionKey: {
          name: "pk",
          type: "S"
        },
        sortKey: {
          name: "sk",
          type: "S"
        },
        timeToLiveAttribute: "ttl",
      },
      indices: [{
        indexName: "test-table-gsi-1",
        projectionType: "ALL",
        partitionKey: {
          name: "pk1",
          type: "S",
        },
        sortKey: {
          name: "sk1",
          type: "S",
        }
      }]
    }, {
      table: {
        tableName: "test-table",
        removalPolicy: "destroy",
        billingMode: "PAY_PER_REQUEST",
        partitionKey: {
          name: "pk",
          type: "S"
        },
        sortKey: {
          name: "sk",
          type: "S"
        },
        timeToLiveAttribute: "ttl",
      },
      indices: [{
        indexName: "test-table-gsi-1",
        projectionType: "ALL",
        partitionKey: {
          name: "pk1",
          type: "S",
        },
        sortKey: {
          name: "sk1",
          type: "S",
        }
      }, {
        indexName: "test-table-gsi-2",
        projectionType: "ALL",
        partitionKey: {
          name: "pk2",
          type: "N",
        },
        sortKey: {
          name: "sk2",
          type: "S",
        }
      }, {
        indexName: "test-table-gsi-3",
        projectionType: "ALL",
        partitionKey: {
          name: "pk3",
          type: "S",
        },
        sortKey: {
          name: "sk3",
          type: "S",
        }
      }, {
        indexName: "test-table-gsi-4",
        projectionType: "ALL",
        partitionKey: {
          name: "pk4",
          type: "S",
        },
        sortKey: {
          name: "sk4",
          type: "S",
        }
      }, {
        indexName: "test-table-gsi-5",
        projectionType: "ALL",
        partitionKey: {
          name: "pk5",
          type: "S",
        },
        sortKey: {
          name: "sk5",
          type: "S",
        }
      }]
    }]);
  });

  // ------------------------------------------------------

});
