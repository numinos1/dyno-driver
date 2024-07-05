# Example Application

doc-entity.ts

```ts 
import { DynoEntity, DynoProp } from 'dyno-driver';

@DynoEntity({
  keys: [
    ['DOC#id', 'REP#repoId'],
    ['REP#repoId', 'VER#version']
  ]
})
export class DocEntity {

  @DynoProp({
    type: 'string'
  })
  id: string;

  @DynoProp({
    type:  'string'
  })
  repoId: string;

  @DynoProp({
    type:  'string'
  })
  version: string;
}
```

dyno.ts

```ts
import { DynoDriver } from 'dyno-driver';
import { DocEntity } from './docs-entity';

// Instantiate the Drive
export const dyno = new DynoDriver({
  tableName: 'test-table',
  endpoint: "http://localhost:8000",
  region: "local",
  metrics: true
})
.on('success', event => console.log('SUCCESS', event))
.on('failure', event => console.log('FAILURE', event));

// Instantiate the docs model
export const docsModel = dyno.entity(DocEntity);
```

docs-service.ts

```ts
import { docsModel } from './dyno';

// Get a document using table scan
const doc = await docsModel.getOne({
  where: {
    repoId: '1234abcd',
  },
  consistent: true,
  order: 'asc',
});

// Get a document by pk + sk
const doc = await docsModel.getOne({
  where: {
    repoId: '1234abcd',
    id: '1234abcd'
  },
  consistent: true,
});

// Get a document by pk + sk query
const doc = await docsModel.getOne({
  where: {
    repoId: '1234abcd',
    id: { $gt: '1234' }
  },
  consistent: true,
  order: 'asc',
});

// QUERY FIRST/LAST DOC WITH FILTER
const doc = await docsModel.getOne({
  where: {
    repoId: '1234abcd',
    id: { $gt: '1234' },
    status: 'active',
    encoding: 'json'
  },
  consistent: true,
  order: 'asc',
});

// GET FIRST/LAST DOC IN TABLE SCAN
const doc = await docsModel.getOne({
  consistent: true,
  order: 'asc',
});

```

# DynamoDb Documentation

- https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html
- https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/
- https://www.mongodb.com/docs/manual/reference/operator/query/#std-label-query-projection-operators-top

# Typescript Setup

https://www.totaltypescript.com/tsconfig-cheat-sheet

# Convert Model into CDK Table Schema

```ts
const tables = await docsModel.toCdkTables();
```

```json
[
  {
    "table": {
      "tableName": "dyno-test",
      "removalPolicy": "destroy",
      "billingMode": "PAY_PER_REQUEST",
      "partitionKey": {
        "name": "pk",
        "type": "S"
      },
      "sortKey": {
        "name": "sk",
        "type": "S"
      },
      "timeToLiveAttribute": "ttl"
    },
    "indices": [
      {
        "indexName": "dyno-test-gsi-1",
        "partitionKey": {
          "name": "pk1",
          "type": "S"
        },
        "sortKey": {
          "name": "sk1",
          "type": "S"
        },
        "projectionType": "ALL"
      }
    ]
  }
]
```

# Get Dynamo Table Schemas from a living DynamoDB instance

Use the getDbTables method to fetch ALL the table schemas from a live DynamoDB instance. These can then be compared with 

```ts
const tables = await docsModel.getDbTables();
```

```json
{
  "delta-sync-main-table": {
    "AttributeDefinitions": [
      {
        "AttributeName": "pk",
        "AttributeType": "S"
      },
      {
        "AttributeName": "sk",
        "AttributeType": "S"
      },
      {
        "AttributeName": "gpk",
        "AttributeType": "S"
      },
      {
        "AttributeName": "gsk",
        "AttributeType": "S"
      }
    ],
    "BillingModeSummary": {
      "BillingMode": "PAY_PER_REQUEST",
      "LastUpdateToPayPerRequestDateTime": 2024-02-18T04: 50: 23.648Z
    },
    "CreationDateTime": 2024-02-18T04: 50: 23.648Z,
    "GlobalSecondaryIndexes": [
      {
        "IndexArn": "arn:aws:dynamodb:ddblocal:000000000000:table/delta-sync-main-table/index/gsi",
        "IndexName": "gsi",
        "IndexSizeBytes": 15726656,
        "IndexStatus": "ACTIVE",
        "ItemCount": 9708,
        "KeySchema": [
          {
            "AttributeName": "gpk",
            "KeyType": "HASH"
          },
          {
            "AttributeName": "gsk",
            "KeyType": "RANGE"
          }
        ],
        "Projection": {
          "ProjectionType": "ALL"
        },
        "ProvisionedThroughput": {
          "ReadCapacityUnits": 0,
          "WriteCapacityUnits": 0
        }
      }
    ],
    "ItemCount": 9756,
    "KeySchema": [
      {
        "AttributeName": "pk",
        "KeyType": "HASH"
      },
      {
        "AttributeName": "sk",
        "KeyType": "RANGE"
      }
    ],
    "ProvisionedThroughput": {
      "LastDecreaseDateTime": 1970-01-01T00: 00: 00.000Z,
      "LastIncreaseDateTime": 1970-01-01T00: 00: 00.000Z,
      "NumberOfDecreasesToday": 0,
      "ReadCapacityUnits": 0,
      "WriteCapacityUnits": 0
    },
    "TableArn": "arn:aws:dynamodb:ddblocal:000000000000:table/delta-sync-main-table",
    "TableName": "delta-sync-main-table",
    "TableSizeBytes": 15737213,
    "TableStatus": "ACTIVE"
  }
}
```

Four sections of the table schema are relevant for migrations:

```ts
const COMPARE_TABLE_PROPS = [
  'AttributeDefinitions',
  'GlobalSecondaryIndexes',
  'KeySchema',
  'TableName'
];
```

# Get Model Schemas

```ts
const schema = await docsModel.toModelSchemas();
```

```json
{
  "tableName": "test-table",
  "billingMode": "PAY_PER_REQUEST",
  "removalPolicy": "destroy",
  "tableKeys": [
    [
      {
        "name": "id",
        "alias": "pk",
        "type": "string",
        "token": "S",
        "prefix": "DOC#",
        "isRequired": true,
        "isKey": true,
        "index": 0
      },
      {
        "name": "repoId",
        "alias": "sk",
        "type": "string",
        "token": "S",
        "prefix": "REP#",
        "isRequired": true,
        "isKey": true,
        "index": 0
      }
    ],
    [
      {
        "name": "repoId",
        "alias": "pk1",
        "prefix": "REP#",
        "type": "string",
        "token": "S",
        "isRequired": false,
        "isKey": true,
        "index": 1
      },
      {
        "name": "version",
        "alias": "sk1",
        "type": "string",
        "token": "S",
        "prefix": "VER#",
        "isRequired": false,
        "isKey": true,
        "index": 1
      }
    ]
  ]
}
```