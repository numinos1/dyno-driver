import { TModelSchema } from "@/types";
import { BillingMode, ProjectionType } from "@aws-sdk/client-dynamodb";

/**
 * Export the CDK table & index definitions
 */
export function exportCdkSchemas(schemas: TModelSchema[]) {
  return schemas.map(schema => ({
    table: toCdkTable(schema),
    indices: toCdkIndices(schema)
  }));
}

/**
 * Export the CDK table definitions
 */
function toCdkTable(schema: TModelSchema) {
  const { pk, sk, wcu, rcu } = schema.tableIndex[0];

  return {
    tableName: schema.tableName,
    removalPolicy: schema.removalPolicy,
    billingMode: ((wcu || rcu) 
      ? BillingMode.PROVISIONED
      : BillingMode.PAY_PER_REQUEST),
    provisionedThroughput: (wcu || rcu) 
      ? {
          ReadCapacityUnits: rcu,
          WriteCapacityUnits: wcu
        }
      : undefined,
    partitionKey: {
      name: 'pk',
      type: pk.type as string
    },
    sortKey: {
      name: 'sk',
      type: sk.type as string
    },
    timeToLiveAttribute: 'ttl'
  };
}

/**
 * Export the CDK index definitions
 */
function toCdkIndices(schema: TModelSchema) {
  const indices = schema.tableIndex.slice(1);
  
  return indices.map(({ pk, sk, wcu, rcu, project }, i) => ({
    indexName: toIndexName(schema, i),
    billingMode: (wcu || rcu) 
      ? BillingMode.PROVISIONED
      : BillingMode.PAY_PER_REQUEST,
    provisionedThroughput: (wcu || rcu) 
      ? {
          ReadCapacityUnits: rcu,
          WriteCapacityUnits: wcu
        }
      : undefined,
    projection: {
      ProjectionType: project.length
        ? ProjectionType.INCLUDE
        : ProjectionType.ALL,
      NonKeyAttributes: project
    },
    partitionKey: {
      name: `pk${i + 1}`,
      type: pk.type as string
    },
    sortKey: {
      name: `sk${i + 1}`,
      type: sk.type as string
    },
    projectionType: 'ALL'
  }));
}
  
/**
 * Export the CDK index name
 */
function toIndexName(schema: TModelSchema, index: number) {
  return `${schema.tableName}-gsi-${index + 1}`;
}