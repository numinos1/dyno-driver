import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { GetOptions } from "@/classes/dyno-model";
import { TStrategy } from "../to-strategy";
import { toExpression } from "../to-expression";
import { TPropMap } from "@/types";

/**
 * Query Table
 */
export function queryTable<Type>(
  { consistent, order }: GetOptions<Type>,
  strategy: TStrategy<Type>,
  metrics: boolean,
  propMap: TPropMap,
  limit: number,
): QueryCommand {
  const names = {}, values = {};
  const { table, index, filter, query } = strategy;

  return new QueryCommand({
    TableName: table,
    IndexName: index,
    Select: "ALL_ATTRIBUTES",
    Limit: limit,
    ConsistentRead: consistent === true,
    ScanIndexForward: order !== 'desc',
    //ExclusiveStartKey: { "<keys>": "<AttributeValue>", },
    ReturnConsumedCapacity: metrics ? 'TOTAL' : 'NONE',
    FilterExpression: toExpression(filter, propMap, names, values),
    KeyConditionExpression: toExpression(query, propMap, names, values),
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values
  });
}