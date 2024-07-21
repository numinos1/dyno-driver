import { TItem, TPropMap } from "@/types";
import { toItemAttr } from "./to-item-attr";

/**
 * Create a Start Key
 */
export function toStartKey<T>(
  keys: Partial<T>,
  propMap: TPropMap
): TItem {
  return Object.entries(keys).reduce((StartKey, [key, val]) => {
    const prop = propMap.get(key);

    if (prop) {
      const { prefix, alias, type } = prop;
      StartKey[alias] = toItemAttr(val, type, prefix);
    }
    return StartKey;
  }, {});
}