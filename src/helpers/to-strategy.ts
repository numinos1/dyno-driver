import { TExpression, TIndex, TProp } from '@/types';

// ------------------------------------------------------------------
//                             Types
// ------------------------------------------------------------------

export interface TStrategy<Type> {
  type: TQueryType;
  keys: TProp[];
  table: string;
  index?: string;
  query: Record<string, any>;
  filter: Record<string, any>;
}

interface TTheory {
  type: TQueryType;
  keys: TProp[];
  index: number;
  name: string;
}

export type TKeyType = 'undefined' | 'static' | 'scalar' | 'query';

export enum TQueryType {
  tableScan = 0,
  pkQuery = 1,
  skQuery = 2,
  getItem = 3
}
  
// ------------------------------------------------------------------
//                            Methods
// ------------------------------------------------------------------

/**
 * Analyze where expression to find best query strategy
 */
export function toStrategy<Type>(
  where: TExpression<Type> = {},
  tableKeys: TIndex[],
  table: string
): TStrategy<Type> {
  const { keys, type, index, name } = toTheory(where, tableKeys);
  const filter: Record<string, any> = { ...where }; // copy all where props to filter
  const query: Record<string, any> = {}; 

  // iterate through all the keys in the theory
  keys.forEach(key => {

    // add static key to the query
    if (key.isStatic) {
      query[key.name] = '';
    }
    // move scalar key from filter to query
    // and rename prop to use the correct index alias
    else {
      const value = filter[key.name];

      if (value !== undefined) {
        query[`__${key.alias}`] = value;
        delete filter[key.name];
      }
    }
  });

  return {
    // GSI's can't use "getItem" strategy
    type: index && type === TQueryType.getItem
      ? TQueryType.skQuery
      : type,
    keys,
    query,
    filter,
    table,
    index: index ? name : undefined
  };
}

/**
 * Find the best query theory for a where expression
 */
export function toTheory<Type>(
  where: TExpression<Type>, // Where expression
  tableKeys: TIndex[], // Array of table keys
): TTheory {

  // Default theory (full table scan)
  let theory: TTheory = {
    type: TQueryType.tableScan,
    keys: [], 
    index: 0, // Table keys offset
    name: ''
  };

  // Iterate through the table keys
  for (let index = 0; index < tableKeys.length; ++index) {
    const { pk, sk, name } = tableKeys[index];

    // Partition key has to be defined as a scalar value
    if (toKeyType(pk, where) !== 'scalar') {
      continue;
    }
    // Sort key can be any key type
    switch (toKeyType(sk, where)) {

      // Sort key is a scalar value
      case 'static':
      case 'scalar': {
        return {
          type: TQueryType.getItem,
          keys: [pk, sk],
          index: index,
          name: name
        }
      }
      // Sort key is a nested query
      case 'query': {
        if (theory.type < TQueryType.skQuery) {
          theory = {
            type: TQueryType.skQuery,
            keys: [pk, sk],
            index: index,
            name: name
          };
        }
        break;
      }
      // Sort key is undefined
      case 'undefined': {
        if (theory.type < TQueryType.pkQuery) {
          theory = {
            type: TQueryType.pkQuery,
            keys: [pk],
            index: index,
            name: name
          };
        }
      }
    }
  }
  // Return the best theory
  return theory;
}

/**
 * Find the specified key within where expression
 */
export function toKeyType<Type>(
  prop: TProp, 
  where: TExpression<Type>
): TKeyType {

  // Key is a static prefix with no prop name
  if (prop.isStatic) { 
    return 'static';
  }
  // Expression value for prop name
  const queryValue = where[prop.name];

  // Key not found in expression
  if (queryValue === undefined) {
    return 'undefined';
  }
  // Expression is a nested query object
  if (typeof queryValue === 'object') {
    return 'query';
  }
  // Expression is a scalar value
  return 'scalar';
}

