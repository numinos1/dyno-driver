import { TIndex, TModelSchema, TProp } from "@/types";
import { AttributeDefinition, BillingMode, CreateTableCommandInput, KeyType, ProjectionType } from "@aws-sdk/client-dynamodb";

/**
 * Export Dynamo Schemas
 */
export function exportDynamoSchemas(schemas: TModelSchema[]) {
  return schemas.map(toDynamoSchema);
}

/**
 * Export the dynamo schema
 * 
 * - Used to generate dynamo-db schemas for migrations
 */
function toDynamoSchema(
  schema: TModelSchema
): CreateTableCommandInput {
  const priKeys = schema.tableIndex[0];
  const gsiKeys = schema.tableIndex.slice(1);

  const command: CreateTableCommandInput = {
    TableName: schema.tableName,
    BillingMode: toBillingMode(priKeys),
    ProvisionedThroughput: toProvisionedThroughput(priKeys),
    // TimeToLiveSpecification: {
    //   AttributeName: 'ttl',
    //   Enabled: true
    // },
    //DeletionPolicy: schema.removalPolicy,
    // UpdateReplacePolicy: string;
    AttributeDefinitions: toAttributeDefinitions(schema.tableIndex),
    KeySchema: toKeySchema(priKeys)
  };

  if (gsiKeys.length) {
    // LocalSecondaryIndexes?: LocalSecondaryIndex[];
    command.GlobalSecondaryIndexes = gsiKeys.map((keys, i) => ({
      BillingMode: toBillingMode(keys),
      ProvisionedThroughput: toProvisionedThroughput(keys),
      Projection: toProjection(keys),
      IndexName: toIndexName(schema, i),
      KeySchema: toKeySchema(keys)
    }));
  };

  return command;
}

/**
 * Extract pk & sk keys into an array
 */
function toKeys(index: TIndex) {
  return [index.pk, index.sk];
}

/**
 * Extract Attribute Definitions from Index
 */
function toAttributeDefinitions(index: TIndex[]): AttributeDefinition[] {
  return index.flatMap(toKeys).map(key => ({
    AttributeName: key.alias,
    AttributeType: toAttributeType(key)
  }));
}

/**
 * Export Projection from Keys
 */
function toProjection(keys: TIndex) {
  return {
    ProjectionType: keys.project.length
      ? ProjectionType.INCLUDE
      : ProjectionType.ALL,
    NonKeyAttributes: keys.project
  };
}

/**
 * Extract Key Schema from Keys
 */
function toKeySchema(keys: TIndex) {
  return toKeys(keys).map((key, index) => ({
    AttributeName: key.alias,
    KeyType: index ? KeyType.RANGE : KeyType.HASH
  }));
}

/**
 * Extract Billing Mode from Keys
 */
function toBillingMode(keys: TIndex) {
  return (keys.wcu || keys.rcu)
    ? BillingMode.PROVISIONED
    : BillingMode.PAY_PER_REQUEST;
}

/**
 * Extract Provisioned Throughput from keys
 */
function toProvisionedThroughput(keys: TIndex) {
  return {
    ReadCapacityUnits: keys.rcu,
    WriteCapacityUnits: keys.wcu
  };
}

/**
 * Convert Prop Token to Attribute Type
 */
function toAttributeType(prop: TProp) {
  switch (prop.type) {
    case 'S':
    case 'N':
    case 'B':
      return prop.type;
    default:
      throw new Error(`Invalid Attribute Type ${prop.alias}=${prop.type}`);
  }
}

/**
 * Export the Dynamo index name
 */
function toIndexName(schema: TModelSchema, index: number) {
  return `${schema.tableName}-gsi-${index + 1}`;
}
