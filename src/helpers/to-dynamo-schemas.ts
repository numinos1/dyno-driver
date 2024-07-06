import { TModelSchema, TProp } from "@/types";
import { CreateTableCommandInput } from "@aws-sdk/client-dynamodb";
import { diffObjects } from "@/utils";

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
export function toDynamoSchema(
  schema: TModelSchema
): CreateTableCommandInput {
  return {
    TableName: schema.tableName,
    BillingMode: schema.billingMode,
    // TimeToLiveSpecification: {
    //   AttributeName: 'ttl',
    //   Enabled: true
    // },
    //DeletionPolicy: schema.removalPolicy,
    // UpdateReplacePolicy: string;
    AttributeDefinitions: schema.tableKeys
      .flat()
      .map(prop => ({
        AttributeName: prop.alias,
        AttributeType: toAttributeType(prop)
      })),
    KeySchema: schema.tableKeys[0]
      .map((prop, index) => ({
        AttributeName: prop.alias,
        KeyType: index ? 'RANGE' : 'HASH' 
      })),
    // LocalSecondaryIndexes?: LocalSecondaryIndex[];
    GlobalSecondaryIndexes: schema.tableKeys
      .slice(1)
      .map((props, i) => ({
        //ProvisionedThroughput: ProvisionedThroughput
        Projection: {
          ProjectionType: 'ALL'
        },
        IndexName: toIndexName(schema, i),
        KeySchema: props.map((prop, index) => ({
          AttributeName: prop.alias,
          KeyType: index ? 'RANGE' : 'HASH' 
        }))
      }))
  };
}

/**
 * Convert Prop Token to Attribute Type
 */
export function toAttributeType(prop: TProp) {
  switch (prop.token) {
    case 'S':
    case 'N':
    case 'B':
      return prop.token;
    default:
      throw new Error(`Invalid Attribute Type ${prop.alias}=${prop.token}`);
  }
}

/**
 * Export the Dynamo index name
 */
export function toIndexName(schema: TModelSchema, index: number) {
  return `${schema.tableName}-gsi-${index + 1}`;
}

/**
 * Normalize the Dynamo schema for diffing
 */
export function normalizeDynamoSchema(
  schema: CreateTableCommandInput
): CreateTableCommandInput {
  return {
    TableName: schema.TableName,
    AttributeDefinitions: normalizeKeySchema(schema.AttributeDefinitions),
    KeySchema: normalizeKeySchema(schema.KeySchema),
    GlobalSecondaryIndexes: (schema.GlobalSecondaryIndexes || [])
      .map(entry => ({
        IndexName: entry.IndexName,
        Projection: entry.Projection,
        KeySchema: normalizeKeySchema(entry.KeySchema)
      }))
      .sort((a, b) =>
        a.IndexName.localeCompare(b.IndexName)
      )
  };
}

/**
 * Normalize the Key Schema
 */
function normalizeKeySchema<Type>(list: Type[]): Type[] {
  return (list || []).sort((a: any, b: any) =>
    a.AttributeName.localeCompare(b.AttributeName)
  );
}

/**
 * Compare Model and CDK Schemas
 */
export function compareSchemas(
  modelSchemas: CreateTableCommandInput[],
  dynamoSchemas: CreateTableCommandInput[]
) {
  const tables = new Set<string>();

  modelSchemas.forEach(schema =>
    tables.add(schema.TableName)
  );
  dynamoSchemas.forEach(schema =>
    tables.add(schema.TableName)
  );

  return [...tables].map(tableName => {
    let diffStatus = '';

    const modelSchema = modelSchemas.find(schema =>
      schema.TableName === tableName
    );
    const dynamoSchema = dynamoSchemas.find(schema =>
      schema.TableName === tableName
    );

    if (modelSchema && !dynamoSchema) {
      diffStatus = 'CREATE';
    }
    if (!dynamoSchema && modelSchema) {
      diffStatus = 'DELETE';
    }
    if (!diffObjects(modelSchema, dynamoSchema)) {
      diffStatus = 'UPDATE';
    }
    return {
      tableName,
      diffStatus,
      modelSchema,
      dynamoSchema
    };
  });
} 
