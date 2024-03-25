import { marshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { TProp } from '@/types';

const NO_MARSHALL = new Set(['N', 'S', 'B', 'BOOL', 'NULL']);
const TO_MARSHALL = new Set(['L', 'M', 'SS', 'NS', 'BS']);

export type TItem = Record<string, AttributeValue>;

/**
 * Convert Doc to Item
 */
export function toItem<Type>(
  doc: Partial<Type>,
  props: TProp[]
): TItem {
  const len = props.length;
  const Item = {};

  for (let i = 0; i < len; ++i) {
    const prop = props[i];
    let val = doc[prop.name];

    if (val != null) {
      if (prop.prefix) {
        val = prop.prefix + val;
      }
      Item[prop.alias] = TO_MARSHALL.has(prop.token)
        ? marshall(val)
        : { [prop.token]: val };
    }
    else if (prop.isRequired) {
      throw new Error(`${prop.name} is required`);
    }
  }
  return Item;
}
