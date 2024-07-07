import { BillingMode, CreateTableCommandInput, GlobalSecondaryIndex, ProvisionedThroughput, TableDescription } from "@aws-sdk/client-dynamodb";

/**
 * Normalize the Dynamo schema for diffing
 */
export function normalizeDynamoSchema(
  schema: CreateTableCommandInput | TableDescription
): CreateTableCommandInput {
  let gsi: GlobalSecondaryIndex[] = [];
  
  if (schema.GlobalSecondaryIndexes) {
    gsi = schema.GlobalSecondaryIndexes as GlobalSecondaryIndex[];
  }
  return {
    TableName: schema.TableName,
    BillingMode: toBillingMode(schema),
    ProvisionedThroughput: toProvisionedThroughput(schema),
    AttributeDefinitions: normalizeKeySchema(schema.AttributeDefinitions),
    KeySchema: normalizeKeySchema(schema.KeySchema),
    GlobalSecondaryIndexes: gsi.map(entry => ({
      IndexName: entry.IndexName,
      Projection: entry.Projection,
      ProvisionedThroughput: entry.ProvisionedThroughput,
      KeySchema: normalizeKeySchema(entry.KeySchema)
    })).sort((a, b) => a.IndexName.localeCompare(b.IndexName))
  };
}

/**
 * Normalize Provisioned Throughput
 */
function toProvisionedThroughput(schema: any): ProvisionedThroughput {
  return {
    ReadCapacityUnits: schema.ProvisionedThroughput?.ReadCapacityUnits || 0,
    WriteCapacityUnits: schema.ProvisionedThroughput?.WriteCapacityUnits || 0
  }
}

/**
 * Normalize Billing Mode
 */
function toBillingMode(schema: any): BillingMode {
  if (schema.BillingModeSummary?.BillingMode) {
    return schema.BillingModeSummary.BillingMode;
  }
  if (schema.BillingMode) {
    return schema.BillingMode;
  }
  return undefined;
}

/**
 * Normalize the Key Schema
 */
function normalizeKeySchema<Type>(list: Type[]): Type[] {
  return (list || []).sort((a: any, b: any) =>
    a.AttributeName.localeCompare(b.AttributeName)
  );
}
