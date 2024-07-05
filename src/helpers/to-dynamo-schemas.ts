import { TModelSchema } from "@/types";

/**
 * Export Dynamo Schemas
 */
export function toDynamoSchemas(schemas: TModelSchema[]) {
  return schemas.map(toDynamoSchema);
}

/**
 * Export the dynamo schema
 * 
 * - Used to generate dynamo-db schemas for migrations
 */
export function toDynamoSchema(schema: TModelSchema) {
  return {
    TableName: schema.tableName,
    BillingMode: schema.billingMode,
    TimeToLiveSpecification: {
      AttributeName: 'ttl',
      Enabled: true
    },
    DeletionPolicy: schema.removalPolicy,
    // UpdateReplacePolicy: string;
    AttributeDefinitions: schema.tableKeys
      .flat()
      .map(prop => ({
        AttributeName: prop.alias,
        AttributeType: prop.token
      })),
    KeySchema: schema.tableKeys[0]
      .map(prop => ({
        AttributeName: prop.name,
        KeyType: prop.name === 'pk'
          ? 'HASH'
          : 'RANGE'
      })),
    // LocalSecondaryIndexes?: LocalSecondaryIndex[];
    GlobalSecondaryIndexes: schema.tableKeys
      .slice(1)
      .map((props, i) => ({
        IndexName: toIndexName(schema, i),
        KeySchema: props.map(prop => ({
          AttributeName: prop.name,
          KeyType: prop.name === 'pk'
            ? 'HASH'
            : 'RANGE'
        }))
      }))
  };
}

/**
 * Export the Dynamo index name
 */
export function toIndexName(schema: TModelSchema, index: number) {
  return `${schema.tableName}-gsi-${index + 1}`;
}