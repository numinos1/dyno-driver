import { toItemAttr } from './to-item-attr';
import { TProp, TItem, TIndex } from '@/types';

/**
 * Convert Doc Keys to Item Keys
 */
export function toItemKeys<Type>(
  doc: Partial<Type>,
  index: TIndex,
): TItem {
  return toItemKey(
    doc,
    index.pk,
    toItemKey(
      doc,
      index.sk,
      {}
    )
  );
}

/**
 * Convert Doc Prop to Item Prop
 */
export function toItemKey<Type>(
  doc: Partial<Type>,
  prop: TProp,
  Item: TItem
): TItem {
  const { name, prefix, alias, type, isRequired, isStatic } = prop;

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
  return Item;
}