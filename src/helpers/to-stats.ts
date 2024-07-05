import { TableDescription } from "@aws-sdk/client-dynamodb"; 
import { TDynamoStats } from '@/types';

/**
 * Extract Usage Stats from Dynamo Table Schemas
 */
export function toDynamoStats(tables: TableDescription[]): TDynamoStats[] {
  return tables.reduce((out, table) => {
    out.push({
      table: table.TableName,
      size: table.TableSizeBytes,
      docs: table.ItemCount,
      rcu: table.ProvisionedThroughput.ReadCapacityUnits,
      wcu: table.ProvisionedThroughput.WriteCapacityUnits
    });
    table.GlobalSecondaryIndexes.forEach(index => {
      out.push({
        table: table.TableName,
        index: index.IndexName,
        size: index.IndexSizeBytes,
        docs: index.ItemCount,
        rcu: index.ProvisionedThroughput.ReadCapacityUnits,
        wcu: index.ProvisionedThroughput.WriteCapacityUnits
      });
    });
    return out;
  }, []);
}