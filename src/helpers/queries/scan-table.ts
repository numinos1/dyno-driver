import { QueryCommand } from "@aws-sdk/lib-dynamodb";
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
): QueryCommand {
  const { consistent, order } = options;
  const { table, index, filter } = strategy;
  const names = {}, values = {};
  
  return new QueryCommand({
    TableName: table,
    IndexName: index,
    Select: "ALL_ATTRIBUTES",
    Limit: limit,
    //ExclusiveStartKey: {},
    ReturnConsumedCapacity: metrics ? 'TOTAL' : 'NONE',
    FilterExpression: toExpression(filter, propMap, names, values),
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ConsistentRead: consistent === true,
  });
}