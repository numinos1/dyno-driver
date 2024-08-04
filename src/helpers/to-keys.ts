import { marshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { TPropMap } from '@/types';

const NO_MARSHALL = new Set(['N', 'S', 'B', 'BOOL', 'NULL']);
const TO_MARSHALL = new Set(['L', 'M', 'SS', 'NS', 'BS']);

export type TItem = Record<string, AttributeValue>;

// Number = N (cast as string)
// String = S (value
// Buffer = B (value
// Boolean = BOOL (value)

// Array = L (recurse)
// Map/Object = M (recurse)
// Set = SS, NS, BS

// Date (throw)


/**
 * Create Keys from 
 */
export function toKeys<Type>(
  query: Record<string, any>,
  propMap: TPropMap
): TItem {
  return Object.entries(query).reduce((Item, [key, val]) => {
    const prop = propMap.get(key);

    if (prop.prefix) {
      val = prop.prefix + val;
    }
    Item[prop.alias] = TO_MARSHALL.has(prop.type)
      ? marshall(val)
      : { [prop.type]: val };

    return Item;
  }, {});
}
