import { TModelSchema, TPropTokens } from "@/types";

export const ModelSchemaMock: TModelSchema = {
  "tableName": "test-table",
  "removalPolicy": "destroy",
  "tableIndex": [
    {
      name: 'test-table',
      rcu: 0,
      wcu: 0,
      project: [],
      pk: {
        "name": "id",
        "alias": "pk",
        "type": TPropTokens.string,
        "prefix": "DOC#",
        "isRequired": true,
        "isStatic": false,
        "isKey": true,
        "index": 0
      },
      sk: {
        "name": "repoId",
        "alias": "sk",
        "type": TPropTokens.string,
        "prefix": "REP#",
        "isRequired": true,
        "isStatic": false,
        "isKey": true,
        "index": 0
      }
    },
    {
      name: 'test-table-gsi-1',
      rcu: 0,
      wcu: 0,
      project: [],
      pk: {
        "name": "repoId",
        "alias": "pk1",
        "prefix": "REP#",
        "type": TPropTokens.string,
        "isRequired": false,
        "isStatic": false,
        "isKey": true,
        "index": 1
      },
      sk: {
        "name": "version",
        "alias": "sk1",
        "type": TPropTokens.string,
        "prefix": "VER#",
        "isRequired": false,
        "isStatic": false,
        "isKey": true,
        "index": 1
      }
    }
  ]
};