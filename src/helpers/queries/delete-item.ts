import { TStrategy } from "../to-strategy";
import { DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { toExpression } from "../to-expression";
import { propObject } from "@/utils";
import { TPropMap } from "@/types";
import { toQueryKeys } from "../marshall/to-query-keys";

/**
 * Delete Item
 */
export function deleteItem<Type>(
  strategy: TStrategy<Type>,
  metrics: boolean,
  propMap: TPropMap
): DeleteItemCommand {
  const { table, keys, filter, query } = strategy;
  const names = {}, values = {};

  return new DeleteItemCommand({
    TableName: table,
    Key: toQueryKeys<Type>(query, propMap),
    ReturnConsumedCapacity: metrics ? 'TOTAL' : 'NONE',
    ReturnValues: 'ALL_OLD',
    ConditionExpression: toExpression(filter, propMap, names, values),
    ExpressionAttributeNames: propObject(names),
    ExpressionAttributeValues: propObject(values)
  });
}