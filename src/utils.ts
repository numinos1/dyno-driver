import { TEntity } from "@/types";

/**
 * Entities Map
 */
export const entitiesMap = new Map<Function, TEntity>();

/**
 * Prune null, undefined, and empty strings
 **/
export function prune<Type>(value: Record<string, Type>): Record<string, Type> {
  return Object.entries(value).reduce((out, [key, val]) => {
    if (val != null && val !== '') {
      out[key] = val;
    }
    return out;
  }, {});
}

/**
 * Measure elapsed time in ms
 */
export function Timer() {
  const begin = process.hrtime();

  return function end() {
    const end = process.hrtime(begin);

    return (end[0] * 1000)
      + Math.round(end[1] * 0.0000010);
  }
}
