import { TExpression, TIndex, TProp } from '@/types';

// ------------------------------------------------------------------
//                             Types
// ------------------------------------------------------------------

export interface TStrategy<Type> {
  type: TQueryType;
  keys: TProp[];
  table: string;
  index?: string;
  query: TExpression<Type>;
  filter: TExpression<Type>;
}

interface TTheory {
  type: TQueryType;
  keys: TProp[];
  index: number;
}

export type TKeyType = 'null' | 'value' | 'query';

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
 * To Query Strategy
 */
export function toStrategy<Type>(
  where: TExpression<Type> = {},
  tableIndex: TIndex[],
  table: string
): TStrategy<Type> {
  const { keys, type, index } = toTheory(where, tableIndex);
  const query = {}, filter = {};
  
  // Split where into query & filter
  for (let key in where) {
    keys.find(k => k.name === key)
      ? (query[key] = where[key])
      : (filter[key] = where[key]);
  }

  return {
    type,
    keys,
    query,
    filter,
    table,
    index: index
      ? `${table}-gsi-${index}`
      : undefined
  };
}

/**
 * Find the best query theory
 */
export function toTheory<Type>(
  where: TExpression<Type>,
  tableIndex: TIndex[],
): TTheory {

  // Default theory (full table scan)
  let theory: TTheory = {
    type: TQueryType.tableScan,
    keys: [],
    index: 0,
  };

  // Iterate through the key-sets defined on the model
  for (let index = 0; index < tableIndex.length; ++index) {
    const { pk, sk } = tableIndex[index];

    // Partition key is defined as a value
    if (toKeyType(pk.name, where) !== 'value') {
      continue;
    }

    // Sort key is defined as ???
    switch (toKeyType(sk.name, where)) {

      // Sort key is a value
      case 'value': {
        return {
          type: TQueryType.getItem,
          keys: [pk, sk],
          index: index,
        }
      }
      // Sort key is a query
      case 'query': {
        if (theory.type < TQueryType.skQuery) {
          theory = {
            type: TQueryType.skQuery,
            keys: [pk, sk],
            index: index
          };
        }
        break;
      }
      // Sort key is undefined
      case 'null': {
        if (theory.type < TQueryType.pkQuery) {
          theory = {
            type: TQueryType.pkQuery,
            keys: [pk],
            index: index
          };
        }
      }
    }
  }
  // Return the best theory
  return theory;
}

/**
 * To Key Type
 */
export function toKeyType<Type>(
  key: string,
  where: TExpression<Type>
): TKeyType {

  // Key with prefix but no name
  if (key === '') { 
    return 'value';
  }
  // Expression value for key
  const val = where[key];

  // Key not found in expression
  if (val == null) {
    return 'null';
  }
  // Expression is a query or a value
  return (typeof val === 'object')
    ? 'query'
    : 'value';
}

