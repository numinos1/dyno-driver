import { TExpression, TProp, TPropMap } from "@/types";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { toItem } from "../marshall/to-item";
import { toExpression } from "../to-expression";
import { propObject } from "@/utils";

/**
 * Put Item
 */
export function putItem<Type>(
  doc: Type,
  where: TExpression<Type>,
  metrics: boolean,
  tableName: string,
  propMap: TPropMap,
  propStack: TProp[]
): PutItemCommand {
  const names = {}, values = {};

  return new PutItemCommand({
    TableName: tableName,
    Item: toItem<Type>(doc, propStack),
    ReturnValues: 'NONE', // "ALL_OLD" || "UPDATED_OLD" || "ALL_NEW" || "UPDATED_NEW"
    ReturnConsumedCapacity: metrics ? 'TOTAL' : 'NONE',
    ReturnItemCollectionMetrics: metrics ? 'SIZE' : 'NONE',
    ReturnValuesOnConditionCheckFailure: 'NONE',
    ConditionExpression: toExpression(where, propMap, names, values),
    ExpressionAttributeNames: propObject(names),
    ExpressionAttributeValues: propObject(values),
  });
}