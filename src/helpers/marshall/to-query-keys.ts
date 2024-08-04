import { TExpression, TItem, TPropMap } from '@/types';
import { toItemAttr } from "./to-item-attr";

/**
 * Create Keys from an expression
 */
export function toQueryKeys<Type>(
  query: TExpression<Type>,
  propMap: TPropMap
): TItem {
  return Object.entries(query).reduce((Item, [key, val]) => {
    const prop = propMap.get(key);

    if (prop) {
      Item[prop.alias] = toItemAttr(val, prop.type, prop.prefix);
    }
    return Item;
  }, {});
}