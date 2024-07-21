import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { GetManyOptions } from "@/classes/dyno-model";
import { TStrategy } from "../to-strategy";
import { toExpression } from "../to-expression";
import { TPropMap } from "@/types";
import { propObject } from "@/utils";
import { toStartKey } from "../marshall/to-start-key";

/**
 * Scan Table 
 */
export function scanTable<Type>( 
  options: GetManyOptions<Type>,
  strategy: TStrategy<Type>,
  metrics: boolean,
  propMap: TPropMap
): ScanCommand {
  const { consistent, start, limit } = options;
  const { table, index, filter } = strategy;
  const names = {}, values = {};
  
  return new ScanCommand({
    TableName: table,
    IndexName: index,
    Select: "ALL_ATTRIBUTES",
    Limit: limit,
    ExclusiveStartKey: start && toStartKey(start, propMap),
    ReturnConsumedCapacity: metrics ? 'TOTAL' : 'NONE',
    FilterExpression: toExpression(filter, propMap, names, values),
    ExpressionAttributeNames: propObject(names),
    ExpressionAttributeValues: propObject(values),
    ConsistentRead: consistent === true,
  });
}