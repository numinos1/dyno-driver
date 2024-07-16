import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { GetOptions } from "@/classes/dyno-model";
import { TStrategy } from "../to-strategy";
import { toExpression } from "../to-expression";
import { TPropMap } from "@/types";

/**
 * Scan Table 
 */
export function scanTable<Type>( 
  options: GetOptions<Type>,
  strategy: TStrategy<Type>,
  metrics: boolean,
  propMap: TPropMap,
  limit: number,
): ScanCommand {
  const { consistent, order } = options;
  const { table, index, filter } = strategy;
  const names = {}, values = {};
  const expression = toExpression(filter, propMap, names, values);
  
  return new ScanCommand({
    TableName: table,
    IndexName: index,
    Select: "ALL_ATTRIBUTES",
    Limit: limit,
    //ExclusiveStartKey: {},
    ReturnConsumedCapacity: metrics ? 'TOTAL' : 'NONE',
    FilterExpression: expression,
    ExpressionAttributeNames: expression ? names : undefined,
    ExpressionAttributeValues: expression ? values : undefined,
    ConsistentRead: consistent === true,
  });
}