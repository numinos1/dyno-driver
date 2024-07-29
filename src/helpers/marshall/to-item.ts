import { toItemAttr } from './to-item-attr';
import { TProp, TItem } from '@/types';

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
    const { name, prefix, alias, type, isRequired, isStatic } = props[i];

    if (isStatic) {
      Item[alias] = toItemAttr('', type, prefix);
    }
    else {
      let val = doc[name];

      if (val != undefined) {
        Item[alias] = toItemAttr(val, type, prefix);
      }
      else if (isRequired) {
        throw new Error(`${name} is required`);
      }
    }
  }
  return Item;
}
