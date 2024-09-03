import { TExpression, TProp, TPropMap } from "@/types";
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { toItem } from "../marshall/to-item";
import { toExpression } from "../to-expression";
import { propObject } from "@/utils";

/**
 * Update Item
 */
export function updateItem<Type>(
  doc: Type,
  where: TExpression<Type>,
  metrics: boolean,
  tableName: string,
  propMap: TPropMap,
  propStack: TProp[]
): UpdateItemCommand {
  const names = {}, values = {};

  return new UpdateItemCommand({
    TableName: tableName,
    Key: {}, // TODO
    //Item: toItem<Type>(doc, propStack),
    ReturnValues: 'NONE', // "ALL_OLD" || "UPDATED_OLD" || "ALL_NEW" || "UPDATED_NEW"
    ReturnConsumedCapacity: metrics ? 'TOTAL' : 'NONE',
    ReturnItemCollectionMetrics: metrics ? 'SIZE' : 'NONE',
    ReturnValuesOnConditionCheckFailure: 'NONE',
    ConditionExpression: toExpression(where, propMap, names, values),
    ExpressionAttributeNames: propObject(names),
    ExpressionAttributeValues: propObject(values),
  });
}