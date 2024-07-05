import { TModelSchema } from "@/types";

/**
 * Export the CDK table & index definitions
 */
export function toCdkSchemas(schemas: TModelSchema[]) {
  return schemas.map(schema => ({
    table: toCdkTable(schema),
    indices: toCdkIndices(schema)
  }));
}

/**
 * Export the CDK table definitions
 */
export function toCdkTable(schema: TModelSchema) {
  const [pk, sk] = schema.tableKeys[0];

  return {
    tableName: schema.tableName,
    removalPolicy: schema.removalPolicy,
    billingMode: schema.billingMode,
    partitionKey: {
      name: 'pk',
      type: pk.token
    },
    sortKey: {
      name: 'sk',
      type: sk.token
    },
    timeToLiveAttribute: 'ttl'
  };
}

/**
 * Export the CDK index definitions
 */
export function toCdkIndices(schema: TModelSchema) {
  const indices = schema.tableKeys.slice(1);
  
  return indices.map(([pk, sk], i) => ({
    indexName: toIndexName(schema, i),
    partitionKey: {
      name: `pk${i + 1}`,
      type: pk.token
    },
    sortKey: {
      name: `sk${i + 1}`,
      type: sk.token
    },
    projectionType: 'ALL'
  }));
}
  
/**
 * Export the CDK index name
 */
export function toIndexName(schema: TModelSchema, index: number) {
  return `${schema.tableName}-gsi-${index + 1}`;
}