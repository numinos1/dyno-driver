import { toItemAttr } from './to-item-attr';
import { TProp, TItem, TIndex } from '@/types';

/**
 * Convert Doc Keys to Item Keys
 */
export function toItemKeys<Type>(
  doc: Partial<Type>,
  index: TIndex,
  delDocKeys = false
): TItem {
  const Keys: TItem = {};

  toItemKey(index.pk, doc, Keys, delDocKeys);
  toItemKey(index.sk, doc, Keys, delDocKeys);

  return Keys;
}

/**
 * Convert Doc Prop to Item Prop
 */
function toItemKey<Type>(
  { name, prefix, alias, type, isRequired, isStatic }: TProp,
  doc: Record<string, any>,
  Item: TItem,
  delDocKeys: boolean
): TItem {
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
    if (delDocKeys) {
      delete doc[name];
    }
  }
  return Item;
}