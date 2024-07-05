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

    expect(drive.toCdkSchemas()).toEqual([]);
  });

  // ------------------------------------------------------

  it('constructs with an entity', () => {
    const drive = new DynoDriver({
      tableName: 'test-table',
      metrics: true,
      entities: [EntityMock]
    });

    expect(drive.toCdkSchemas()).toEqual([{
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

    expect(drive.toCdkSchemas()).toEqual([{
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
  //      Migration Methods
  // ------------------------------------------------------

  it('exports model schemas', () => {
    const drive = new DynoDriver({
      tableName: 'test-table',
      metrics: true,
      entities: [EntityMock, Entity2Mock]
    });

    expect(drive.toModelSchemas()).toEqual([{
      "tableName": "test-table",
      "billingMode": "PAY_PER_REQUEST",
      "removalPolicy": "destroy",
      "tableKeys": [
        [
          {
            "alias": "pk",
            "index": 0,
            "isKey": true,
            "isRequired": true,
            "name": "id",
            "prefix": "DOC1#",
            "token": "S",
            "type": "string",
          },
          {
            "alias": "sk",
            "index": 0,
            "isKey": true,
            "isRequired": true,
            "name": "repoId",
            "prefix": "REP#",
            "token": "S",
            "type": "string",
          },
        ],
        [
          {
            "alias": "pk1",
            "index": 1,
            "isKey": true,
            "isRequired": false,
            "name": "repoId",
            "prefix": "REP1#",
            "token": "S",
            "type": "string",
          },
          {
            "alias": "sk1",
            "index": 1,
            "isKey": true,
            "isRequired": false,
            "name": "version",
            "prefix": "VER#",
            "token": "S",
            "type": "string",
          },
        ],
        [
          {
            "alias": "pk2",
            "index": 2,
            "isKey": true,
            "isRequired": false,
            "name": "createdOn",
            "prefix": "",
            "token": "N",
            "type": "number",
          },
          {
            "alias": "sk2",
            "index": 2,
            "isKey": true,
            "isRequired": false,
            "name": "status",
            "prefix": "",
            "token": "S",
            "type": "string",
          },
        ],
        [
          {
            "alias": "pk3",
            "index": 3,
            "isKey": true,
            "isRequired": false,
            "name": "",
            "prefix": "USER#",
            "token": "S",
            "type": "string",
          },
          {
            "alias": "sk3",
            "index": 3,
            "isKey": true,
            "isRequired": false,
            "name": "createdBy",
            "prefix": "",
            "token": "S",
            "type": "string",
          },
        ],
        [
          {
            "alias": "pk4",
            "index": 4,
            "isKey": true,
            "isRequired": false,
            "name": "createdBy",
            "prefix": "",
            "token": "S",
            "type": "string",
          },
          {
            "alias": "sk4",
            "index": 4,
            "isKey": true,
            "isRequired": false,
            "name": "",
            "prefix": "USER#",
            "token": "S",
            "type": "string",
          },
        ],
        [
          {
            "alias": "pk5",
            "index": 5,
            "isKey": true,
            "isRequired": false,
            "name": "repoId",
            "prefix": "",
            "token": "S",
            "type": "string",
          },
          {
            "alias": "sk5",
            "index": 5,
            "isKey": true,
            "isRequired": false,
            "name": "repoId",
            "prefix": "",
            "token": "S",
            "type": "string",
          },
        ],
      ]
    }]);
  });
  
});
