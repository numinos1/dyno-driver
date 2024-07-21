import { GetManyOptions } from "@/classes/dyno-model";
import { TStrategy } from "../to-strategy";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { toKeys } from "../to-keys";

/**
 * Get Item
 */
export function getItem<Type>(
  options: GetManyOptions<Type>,
  strategy: TStrategy<Type>,
  metrics: boolean
): GetItemCommand {
  const { consistent } = options;
  const { table, index, keys, query } = strategy;

  return new GetItemCommand({
    TableName: index || table,
    Key: toKeys<Type>(keys, query),
    ConsistentRead: consistent === true,
    ReturnConsumedCapacity: metrics ? 'TOTAL' : 'NONE'
  });
}