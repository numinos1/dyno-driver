import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { toQueryAttr } from "./marshall/to-query-attr";
import { TProp, TPropMap } from "@/types";

// ------------------------------------------------------------------
//      Type Definitions
// ------------------------------------------------------------------

type TClause = (value: any, prop: TProp) => void;
type TClauseMap = Record<string, TClause>;

type KeysOfType<T, ValueType> = {
  [K in keyof T]: T[K] extends ValueType ? K : never;
}[keyof T];

type ArrayType<T> = T extends Array<infer U> ? U : T;
type SetType<T> = T extends Set<infer U> ? U : T;

type ObjectKeys<T> = KeysOfType<T, object>;
type ArrayKeys<T> = KeysOfType<T, Array<any>>;
type NumberKeys<T> = KeysOfType<T, number>;
type SetKeys<T> = KeysOfType<T, Set<any>>;

export type TUpdateExpr<T> = {
  $create?: Partial<T>;
  $set?: Partial<T>;
  $unset?: {
    [P in keyof T]: any
  };
  $setPath?: {
    [P in ObjectKeys<T>]?: {
      path: string;
      value: any;
    }
  };
  $unsetPath?:{
    [P in ObjectKeys<T>]?: {
      path: string;
      value: any;
    }
  };
  $setIndex?: {
    [P in ArrayKeys<T>]?: {
      index: number;
      value: ArrayType<T[P]>;
    }
  };
  $unsetIndex?: {
    [P in ArrayKeys<T>]?: {
      index: number;
      value: ArrayType<T[P]>;
    }
  };
  $append?: {
    [P in ArrayKeys<T>]?: ArrayType<T[P]>;
  };
  $prepend?: {
    [P in ArrayKeys<T>]?: ArrayType<T[P]>;
  };
  $increment?: {
    [P in NumberKeys<T>]?: number;
  };
  $decrement?: {
    [P in NumberKeys<T>]?: number;
  };
  $add?: {
    [P in SetKeys<T>]?: SetType<T[P]> | SetType<T[P]>[];
  };
  $delete?: {
    [P in SetKeys<T>]?: SetType<T[P]> | SetType<T[P]>[];
  };
}

// interface Example {
//   id: number;
//   name: string;
//   map: Record<string, any>;
//   names: string[];
//   ages: number[];
//   colors: Set<string>;
//   tokens: Set<number>;
// };

// const x: TUpdateExpr<Example> = {
//   $set: {
//     name: 'andrew',
//     id: 10,
//   },
//   $setPath: {
//     map: {
//       path: 'path.here',
//       value: 10,
//     }
//   },
//   $setIndex: {
//     names: {
//       index: 2,
//       value: 'aaaa'
//     },
//     ages: {
//       index: 3,
//       value: 53
//     }
//   },
//   $append: {
//     names: 'andrew',
//     ages: 10
//   },
//   $prepend: {
//     names: 'bunker',
//     ages: 2
//   },
//   $increment: {
//     id: 10
//   },
//   $decrement: {
//     id: 10,
//   },
//   $add: {
//     colors: ['green', 'yellow'],
//     tokens: 10
//   }
// };

// ------------------------------------------------------------------
//      Update Method
// ------------------------------------------------------------------

/**
 * Render an Update Expression
 */
export function toUpdate<Type>(
  update: TUpdateExpr<Type>,
  props: TPropMap,
  names: Record<string, string>,
  values: Record<string, AttributeValue>
): string {
  let valueCount = 0;
  const sets: string[] = [];
  const removes: string[] = [];
  const adds: string[] = [];
  const deletes: string[] = [];

  /**
   * Create Clause Action Hash Map
   */
  const clauseActions: TClauseMap = {
    $create, // any
    $set, $unset, // any
    $setPath, $unsetPath, // map
    $setIndex, $unsetIndex, // list
    $append, $prepend, // list
    $increment, $decrement, // number
    $add, $delete // set
  }

  /**
   * Process the Update Clauses
   */
  Object.entries(update).forEach(([clause, entries]) => {
    const $clause = clauseActions[clause];

    if (!$clause) {
      throw new Error(`Invalid update clause: "${clause}" `);
    }
    if (!entries || typeof entries !== 'object') {
      throw new Error(`Invalid update object for: "${clause}"`);
    }
    Object.entries(entries).forEach(([key, value]) => {
      const prop = props.get(key);

      if (!prop) {
        throw new Error(`invalid update property: ${clause} -> "${key}"`);
      }
      $clause(value, prop);
    });
  });

  /**
   * Render the output Expression
   */
  const expression = [];

  if (sets.length) {
    expression.push(`SET ${sets.join(', ')}`);
  }
  if (removes.length) {
    expression.push(`REMOVE ${removes.join(', ')}`);
  }
  if (adds.length) {
    expression.push(`ADD ${adds.join(', ')}`);
  }
  if (deletes.length) {
    expression.push(`DELETE ${deletes.join(', ')}`);
  }
  return expression.join(' ');

  // ------------------------------------------------------
  //      Helper Methods
  // ------------------------------------------------------

  function toName(alias: string) {
    const nameKey = `#${alias}`;

    if (!names[nameKey]) {
      names[nameKey] = alias;
    }
    return nameKey;
  }

  function toValue(value: any, prop: TProp) {
    const valueKey = `:v${++valueCount}`;

    values[valueKey] = toQueryAttr(
      value,
      prop.prefix ? '' : prop.prefix
    );
    return valueKey;
  }

  // ------------------------------------------------------
  //      Update Clauses
  // ------------------------------------------------------

  function $create(value: any, prop: TProp) {
    const nkey = toName(prop.alias);
    const vkey = toValue(value, prop);
    sets.push(`${nkey} = if_not_exists(${nkey}, ${vkey})`);
  }

  function $set(value: any, prop: TProp) {
    const nkey = toName(prop.alias);
    const vkey = toValue(value, prop);
    sets.push(`${nkey} = ${vkey}`);
  }

  function $unset(value: any, prop: TProp) {
    const nkey = toName(prop.alias);
    removes.push(nkey);
  }

  function $setPath(value: any, prop: TProp) {
    const nkey = toName(`${prop.alias}.${value.path}`);
    const vkey = toValue(value.value, prop);
    sets.push(`${nkey} = ${vkey}`);
  }

  function $unsetPath(value: any, prop: TProp) {
    const nkey = toName(`${prop.alias}.${value.path}`);
    deletes.push(nkey);
  }

  function $setIndex(value: any, prop: TProp) {
    const nkey = toName(`${prop.alias}[${value.index}]`);
    const vkey = toValue(value.value, prop);
    sets.push(`${nkey} = ${vkey}`);
  }

  function $unsetIndex(value: any, prop: TProp) {
    const nkey = toName(`${prop.alias}[${value.index}]`);
    deletes.push(nkey);
  }

  function $append(value: any, prop: TProp) {
    const nkey = toName(prop.alias);
    const vkey = toValue(value, prop);
    sets.push(`${nkey} = list_append(${nkey}, ${vkey})`);
  }

  function $prepend(value: any, prop: TProp) {
    const nkey = toName(prop.alias);
    const vkey = toValue(value, prop);
    sets.push(`${nkey} = list_append(${vkey}, ${nkey})`);
  }

  function $increment(value: any, prop: TProp) {
    const nkey = toName(prop.alias);
    const vkey = toValue(value, prop);
    sets.push(`${nkey} = ${nkey} + ${vkey}`);
  }

  function $decrement(value: any, prop: TProp) {
    const nkey = toName(prop.alias);
    const vkey = toValue(value, prop);
    sets.push(`${nkey} = ${nkey} - ${vkey}`);
  }

  function $add(value: any, prop: TProp) {
    const nkey = toName(prop.alias);
    const vkey = toValue(value, prop);
    adds.push(`${nkey} ${vkey}`);
  }

  function $delete(value: any, prop: TProp) {
    const nkey = toName(prop.alias);
    const vkey = toValue(value, prop);
    deletes.push(`${nkey} ${vkey}`);
  }
}
