import "reflect-metadata";
import { describe, expect, it } from '@jest/globals';
import { DynoDriver } from '@/classes/dyno-driver';
import { EntityMock } from '@/tests/mocks/entity.mock';
import { Entity2Mock } from '@/tests/mocks/entity-2.mock';

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

    expect(drive.exportCdkSchemas()).toEqual([]);
  });

  // ------------------------------------------------------

  it('constructs with an entity', () => {
    const drive = new DynoDriver({
      tableName: 'test-table',
      metrics: true,
      entities: [EntityMock]
    });

    expect(drive.exportCdkSchemas()).toEqual([{
      table: {
        tableName: "test-table",
        removalPolicy: "destroy",
        billingMode: "PAY_PER_REQUEST",
        provisionedThroughput: undefined,
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
        billingMode: "PAY_PER_REQUEST",
        provisionedThroughput: undefined,
        projectionType: "ALL",
        projection: {
          NonKeyAttributes: [],
          ProjectionType: "ALL"
        },
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

    expect(drive.exportCdkSchemas()).toEqual([{
      table: {
        tableName: "test-table",
        removalPolicy: "destroy",
        billingMode: "PAY_PER_REQUEST",
        provisionedThroughput: undefined,
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
        billingMode: "PAY_PER_REQUEST",
        provisionedThroughput: undefined,
        projection: {
          NonKeyAttributes: [],
          ProjectionType: "ALL"
        },
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
        billingMode: "PAY_PER_REQUEST",
        provisionedThroughput: undefined,
        projection: {
          NonKeyAttributes: [],
          ProjectionType: "ALL"
        },
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
        billingMode: "PAY_PER_REQUEST",
        provisionedThroughput: undefined,
        projection: {
          NonKeyAttributes: [],
          ProjectionType: "ALL"
        },
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
        billingMode: "PAY_PER_REQUEST",
        provisionedThroughput: undefined,
        projection: {
          NonKeyAttributes: [],
          ProjectionType: "ALL"
        },
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
        billingMode: "PAY_PER_REQUEST",
        provisionedThroughput: undefined,
        projection: {
          NonKeyAttributes: [],
          ProjectionType: "ALL"
        },
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
  //      Migration Methods
  // ------------------------------------------------------

  it('exports model schemas', () => {
    const drive = new DynoDriver({
      tableName: 'test-table',
      metrics: true,
      entities: [EntityMock, Entity2Mock]
    });

    expect(drive.exportModelSchemas()).toEqual([{
      "tableName": "test-table",
      "removalPolicy": "destroy",
      "tableIndex": [
        {
          wcu: 0,
          rcu: 0,
          project: [],
          pk: {
            "alias": "pk",
            "index": 0,
            "isKey": true,
            "isRequired": true,
            "isStatic": false,
            "name": "id",
            "prefix": "DOC1#",
            "type": "S",
          },
          sk: {
            "alias": "sk",
            "index": 0,
            "isKey": true,
            "isRequired": true,
            "isStatic": false,
            "name": "repoId",
            "prefix": "REP#",
            "type": "S",
          },
        },
        {
          wcu: 0,
          rcu: 0,
          project: [],
          pk: {
            "alias": "pk1",
            "index": 1,
            "isKey": true,
            "isRequired": false,
            "isStatic": false,
            "name": "repoId",
            "prefix": "REP1#",
            "type": "S",
          },
          sk: {
            "alias": "sk1",
            "index": 1,
            "isKey": true,
            "isRequired": false,
            "isStatic": false,
            "name": "version",
            "prefix": "VER#",
            "type": "S",
          },
        },
        {
          wcu: 0,
          rcu: 0,
          project: [],
          pk: {
            "alias": "pk2",
            "index": 2,
            "isKey": true,
            "isRequired": false,
            "isStatic": false,
            "name": "createdOn",
            "prefix": "EM2#",
            "type": "N",
          },
          sk: {
            "alias": "sk2",
            "index": 2,
            "isKey": true,
            "isRequired": false,
            "isStatic": false,
            "name": "status",
            "prefix": "",
            "type": "S",
          },
        },
        {
          wcu: 0,
          rcu: 0,
          project: [],
          pk: {
            "alias": "pk3",
            "index": 3,
            "isKey": true,
            "isRequired": false,
            "isStatic": true,
            "name": "__pk3",
            "prefix": "USER#",
            "type": "S",
          },
          sk: {
            "alias": "sk3",
            "index": 3,
            "isKey": true,
            "isRequired": false,
            "isStatic": false,
            "name": "createdBy",
            "prefix": "",
            "type": "S",
          },
        },
        {
          wcu: 0,
          rcu: 0,
          project: [],
          pk: {
            "alias": "pk4",
            "index": 4,
            "isKey": true,
            "isRequired": false,
            "isStatic": false,
            "name": "createdBy",
            "prefix": "EM2#",
            "type": "S",
          },
          sk: {
            "alias": "sk4",
            "index": 4,
            "isKey": true,
            "isRequired": false,
            "isStatic": true,
            "name": "__sk4",
            "prefix": "USER#",
            "type": "S",
          },
        },
        {
          wcu: 0,
          rcu: 0,
          project: [],
          pk: {
            "alias": "pk5",
            "index": 5,
            "isKey": true,
            "isRequired": false,
            "isStatic": false,
            "name": "repoId",
            "prefix": "EM2#",
            "type": "S",
          },
          sk: {
            "alias": "sk5",
            "index": 5,
            "isKey": true,
            "isRequired": false,
            "isStatic": false,
            "name": "repoId",
            "prefix": "EM2#",
            "type": "S",
          },
        },
      ]
    }]);
  });
  
});
