import { BillingMode } from "@aws-sdk/client-dynamodb";
import { TModelSchema, TPropTokens } from "../../src/types";

export const ModelSchemaMock: TModelSchema = {
  "tableName": "test-table",
  "billingMode": BillingMode.PAY_PER_REQUEST,
  "removalPolicy": "destroy",
  "tableKeys": [
    [
      {
        "name": "id",
        "alias": "pk",
        "type": "string",
        "token": TPropTokens.string,
        "prefix": "DOC#",
        "isRequired": true,
        "isKey": true,
        "index": 0
      },
      {
        "name": "repoId",
        "alias": "sk",
        "type": "string",
        "token": TPropTokens.string,
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
        "token": TPropTokens.string,
        "isRequired": false,
        "isKey": true,
        "index": 1
      },
      {
        "name": "version",
        "alias": "sk1",
        "type": "string",
        "token": TPropTokens.string,
        "prefix": "VER#",
        "isRequired": false,
        "isKey": true,
        "index": 1
      }
    ]
  ]
};