import { TEntity } from "@/types";

/**
 * Entities Map
 */
export const entitiesMap = new Map<Function, TEntity>();

// ------------------------------------------------------------------
//      Time & Date Utilities
// ------------------------------------------------------------------

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
 * Copy props from an object
 **/
export function copyProps(obj: any, propNames: string[]) {
  const src = (obj && typeof obj === 'object')
    ? obj 
    : {};

  return propNames.reduce((out, key) => {
    out[key] = src[key];
    return out;
  }, {});
}

/**
 * Recursively diff two objects
 **/
export function diffObjects(canonical: any, copy: any) {
  if (canonical === copy) {
    return true;
  }
  if (typeof canonical !== typeof copy) {
    return false;
  }
  if (Array.isArray(canonical)) {
    if (!Array.isArray(copy)) {
      return false;
    }
    if (canonical.length !== copy.length) {
      return false;
    }
    return canonical.reduce((out, val, index) => 
      out && diffObjects(val, copy[index]),
      true
    );
  }
  if (canonical && typeof canonical === 'object') {
    if (!copy) {
      return false;
    }
    return Object.entries(canonical).reduce((out, [key, val]) => 
      out && diffObjects(val, copy[key]),
      true
    );
  }
  return false;
}