import { TModelSchema, TPropTokens } from "@/types";

export const ModelSchemaMock: TModelSchema = {
  "tableName": "test-table",
  "removalPolicy": "destroy",
  "tableIndex": [
    {
      rcu: 0,
      wcu: 0,
      project: [],
      pk: {
        "name": "id",
        "alias": "pk",
        "type": "string",
        "token": TPropTokens.string,
        "prefix": "DOC#",
        "isRequired": true,
        "isKey": true,
        "index": 0
      },
      sk: {
        "name": "repoId",
        "alias": "sk",
        "type": "string",
        "token": TPropTokens.string,
        "prefix": "REP#",
        "isRequired": true,
        "isKey": true,
        "index": 0
      }
    },
    {
      rcu: 0,
      wcu: 0,
      project: [],
      pk: {
        "name": "repoId",
        "alias": "pk1",
        "prefix": "REP#",
        "type": "string",
        "token": TPropTokens.string,
        "isRequired": false,
        "isKey": true,
        "index": 1
      },
      sk: {
        "name": "version",
        "alias": "sk1",
        "type": "string",
        "token": TPropTokens.string,
        "prefix": "VER#",
        "isRequired": false,
        "isKey": true,
        "index": 1
      }
    }
  ]
};