import { TExpression, TIndex, TPropMap } from "@/types";
import { ReturnValue, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { toExpression } from "../to-expression";
import { toUpdate, TUpdateExpr } from "../to-update";
import { propObject } from "@/utils";
import { toItemKeys } from "../marshall/to-item-keys";

/**
 * Update Item
 */
export function updateItem<Type>(
  keys: Partial<Type>,
  updates: TUpdateExpr<Type>,
  where: TExpression<Type>,
  returns: ReturnValue,
  metrics: boolean,
  tableName: string,
  propMap: TPropMap,
  tableIndex: TIndex[],
): UpdateItemCommand {
  const names = {}, values = {};

  return new UpdateItemCommand({
    TableName: tableName,
    Key: toItemKeys(keys, tableIndex[0]),
    ReturnValues: returns || 'NONE', 
    ReturnConsumedCapacity: metrics ? 'TOTAL' : 'NONE',
    ReturnItemCollectionMetrics: metrics ? 'SIZE' : 'NONE',
    ReturnValuesOnConditionCheckFailure: 'NONE',
    UpdateExpression: toUpdate(updates, propMap, names, values),
    ConditionExpression: toExpression(where, propMap, names, values),
    ExpressionAttributeNames: propObject(names),
    ExpressionAttributeValues: propObject(values),
  });
}