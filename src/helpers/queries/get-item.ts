import { GetManyOptions } from "@/classes/dyno-model";
import { TStrategy } from "../to-strategy";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { TPropMap } from "@/types";
import { toQueryKeys } from "../marshall/to-query-keys";

/**
 * Get Item
 */
export function getItem<Type>(
  options: GetManyOptions<Type>,
  strategy: TStrategy<Type>,
  metrics: boolean,
  propMap: TPropMap
): GetItemCommand {
  const { consistent } = options;
  const { table, index, query } = strategy;

  return new GetItemCommand({
    TableName: index || table,
    Key: toQueryKeys<Type>(query, propMap),
    ConsistentRead: consistent === true,
    ReturnConsumedCapacity: metrics ? 'TOTAL' : 'NONE'
  });
}