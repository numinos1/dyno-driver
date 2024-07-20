import { TEntity } from "@/types";

/**
 * Entities Map
 */
export const entitiesMap = new Map<Function, TEntity>();

// ------------------------------------------------------------------
//      Time & Date Utilities
// ------------------------------------------------------------------

export type TTimer = () => number;

/**
 * Measure elapsed time in ms
 */
export function Timer(): TTimer {
  const begin = process.hrtime();

  return function end() {
    const end = process.hrtime(begin);

    return (end[0] * 1000)
      + Math.round(end[1] * 0.0000010);
  }
}

// ------------------------------------------------------------------
//      Object Utilities
// ------------------------------------------------------------------

/**
 * Recursive Copy Object
 */
export function copyObject<Type>(value: Type): Type {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Prune null, undefined, and empty strings
 **/
export function pruneObject<Type>(value: Record<string, Type>): Record<string, Type> {
  return Object.entries(value).reduce((out, [key, val]) => {
    if (val != null && val !== '') {
      out[key] = val;
    }
    return out;
  }, {});
}

/**
 * Recursively diff two objects
 **/
export function diffObjects(canonical: any, copy: any) {
  if (typeof canonical !== typeof copy) {
    return false;
  }
  if (Array.isArray(canonical)) {
    if (canonical.length !== copy.length) {
      return false;
    }
    return canonical.every((val, index) =>
      diffObjects(val, copy[index])
    );
  }
  if (canonical && typeof canonical === 'object') {
    if (!copy) {
      return false;
    }
    const keys = new Set<string>(
      Object.keys(canonical)
        .concat(Object.keys(copy))
    );
    return [...keys].every(key => 
      diffObjects(canonical[key], copy[key])
    );
  }
  return (canonical === copy);
}

/**
 * Only allow objects with defined props through
 */
export function propObject<Type>(value: Type): Type | undefined {
  if (!value) return undefined;
  if (typeof value !== 'object') return undefined;
  if (!Object.keys(value).length) return undefined;

  return value;
}