import { TExpression, TProp, TItem } from '@/types';
import { toItemAttr } from "./to-item-attr";

/**
 * Create Keys from an expression
 */
export function toQueryKeys<Type>(
  keys: TProp[],
  query: TExpression<Type>
): TItem {
  const len = keys.length;
  const Item = {};

  for (let i = 0; i < len; ++i) {
    const { name, prefix, alias, type } = keys[i];
    let val = query[name];

    if (val != undefined) {
      Item[alias] = toItemAttr(val, type, prefix);
    }
  }
  return Item;
}