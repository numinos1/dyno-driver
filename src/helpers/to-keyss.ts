import { marshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { TExpression, TProp } from '@/types';

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
  keys: TProp[],
  query: TExpression<Type>
): TItem {
  const len = keys.length;
  const Item = {};

  for (let i = 0; i < len; ++i) {
    const prop = keys[i];
    let val = query[prop.name] || '';

    if (prop.prefix) {
      val = prop.prefix + val;
    }
    Item[prop.alias] = TO_MARSHALL.has(prop.type)
      ? marshall(val)
      : { [prop.type]: val };
  }
  return Item;
}
