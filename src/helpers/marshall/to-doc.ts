import { toDocAttr } from './to-doc-attr';
import { TProp, TItem } from '@/types';

/**
 * Convert a Dynamo record to a document
 */
export function toDoc<Type>(
  Item: TItem,
  props: TProp[],
  propCount: number,
): Type {
  const Doc = {};

  for (let i = 0; i < propCount; ++i) {
    const { prefix, name, alias } = props[i];
    const attrVal = Item[alias];

    if (attrVal) {
      const val = toDocAttr(attrVal, prefix);

      if (val !== undefined) {
        Doc[name] = val;
      }
    }
  }
  return Doc as Type;
}
