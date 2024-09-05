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
  where: TExpression<Type>,
  updates: TUpdateExpr<Type>,
  returns: ReturnValue,
  metrics: boolean,
  tableName: string,
  propMap: TPropMap,
  tableIndex: TIndex[],
): UpdateItemCommand {
  const expr = { ...where };
  const names = {}, values = {};

  return new UpdateItemCommand({
    TableName: tableName,
    Key: toItemKeys(expr, tableIndex[0], true),
    ReturnValues: returns || 'ALL_NEW', 
    ReturnConsumedCapacity: metrics ? 'TOTAL' : 'NONE',
    ReturnItemCollectionMetrics: metrics ? 'SIZE' : 'NONE',
    ReturnValuesOnConditionCheckFailure: 'NONE',
    UpdateExpression: toUpdate(updates, propMap, names, values),
    ConditionExpression: toExpression(expr, propMap, names, values),
    ExpressionAttributeNames: propObject(names),
    ExpressionAttributeValues: propObject(values),
  });
}
