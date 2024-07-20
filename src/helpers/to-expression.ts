import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { TPropTokens, PropTypes, TExpression } from '@/types';
import { TProp, TPropMap } from '@/types';
import { toQueryAttr } from "./marshall/to-query-attr";

/**
 * Evaluate Expression
 * 
 * TODO:
 * - How to handle nested props ??????
 */
export function toExpression<Type>(
  expr: TExpression<Type>,
  props: TPropMap,
  names: Record<string, string>,
  values: Record<string, AttributeValue>
): string | undefined {
  if (!expr) {
    return undefined;
  }
  let valueCount: number = Object.keys(values).length;

  const $operators = {
    $and, $or, $nor,
    $eq, $ne, $lt, $le, $gt, $ge, $in, $between,
    $exists, $type, $begins, $contains, $size
  };

  // Main Routine
  return evalExpr(expr) || undefined;

  /**
   * Evaluate Any Expression
   */
  function evalExpr(
    expr: any,
    prop?: TProp,
    operator: string = 'AND',
  ): string {
    if (expr && typeof expr === 'object') {
      const entries = Array.isArray(expr)
        ? expr.map(val => evalExpr(val, prop))
        : evalObject(expr, prop);
      const out = entries.join(` ${operator} `);
      return entries.length > 1 ? `(${out})` : out;
    }
    if (!prop) {
      throw new Error(`invalid context: "${expr}"`);
    }
    return $eq(expr, prop);
  }

  /**
   * Evaluate Object Expression
   */
  function evalObject(expr: any, prop?: TProp): string[] {
    return Object.entries(expr).map(([key, val]) => {
      const $operator = $operators[key];

      if ($operator) {
        return $operator(val, prop);
      }
      if (!(prop = props.get(key))) {
        throw new Error(`invalid property: "${key}"`);
      }
      return evalExpr(val, prop);
    });
  }

  /**
   * To Name
   */
  function toName(val: string, prop?: TProp): string {
    if (!prop) {
      throw new Error(`${val} missing context`);
    }
    if (prop.alias.indexOf('size(') === 0) {
      return prop.alias;
    }
    const nameKey = `#${prop.alias}`;

    if (!names[nameKey]) {
      names[nameKey] = prop.alias;
    }
    return nameKey;
  }

  /**
   * To Value
   */
  function toValue(val: any, prop?: TProp, noPrefix = false): string {
    if (!prop) {
      throw new Error(`${val} missing context`);
    }
    const valueKey = `:v${++valueCount}`;

    values[valueKey] = toQueryAttr(val, noPrefix ? '' : prop.prefix);

    return valueKey;
  }

  // ----------------------------------------------------------------
  //                       Operators
  // ----------------------------------------------------------------

  function $and(val: any, prop?: TProp): string {
    return evalExpr(val, prop, 'AND');
  }

  function $or(val: any, prop?: TProp): string {
    return evalExpr(val, prop, 'OR');
  }

  function $nor(val: any, prop?: TProp): string {
    return `NOT ${evalExpr(val, prop)}`;
  }

  // ----------------------------------------------------------------
  //                       Comparators
  // ----------------------------------------------------------------

  function $eq(val: any, prop?: TProp): string {
    return `${toName('$eq', prop)} = ${toValue(val, prop)}`;
  }
  
  function $ne(val: any, prop?: TProp): string {
    return `${toName('$ne', prop)} <> ${toValue(val, prop)}`;
  }

  function $lt(val: any, prop?: TProp): string {
    return `${toName('$lt', prop)} < ${toValue(val, prop)}`;
  }

  function $le(val: any, prop?: TProp): string {
    return `${toName('$le', prop)} <= ${toValue(val, prop)}`;
  }

  function $gt(val: any, prop?: TProp): string {
    return `${toName('$gt', prop)} > ${toValue(val, prop)}`;
  }

  function $ge(val: any, prop?: TProp): string {
    return `${toName('$ge', prop)} >= ${toValue(val, prop)}`;
  }

  function $in(val: any, prop?: TProp): string {
    if (!Array.isArray(val)) {
      throw new Error(`$in value not an array: ${val}`);
    }
    const values = val.map(v => toValue(v, prop));
    return `${toName('$in', prop)} IN (${values})`;
  }

  function $between(val: any, prop?: TProp): string {
    if (!Array.isArray(val)) {
      throw new Error(`$between value not an array`);
    }
    const from = toValue(val[0], prop);
    if (from == null) {
      throw new Error(`$between: [from, to] missing from`);
    }
    const to = toValue(val[1], prop);
    if (to == null) {
      throw new Error(`$between: [from, to] missing to`);
    }
    return `(${toName('$between', prop)} BETWEEN ${from} AND ${to})`;
  }

  // ----------------------------------------------------------------
  //                       Functions
  // ----------------------------------------------------------------

  function $exists(val: any, prop?: TProp): string {
    return val
      ? `attribute_exists(${toName('$exists', prop)})`
      : `attribute_not_exists(${toName('$exists', prop)})`;
  }

  function $type(val: any, prop?: TProp): string {
    let type: TPropTokens | null = null;

    if (typeof val === 'string') {
      type = TPropTokens[val];
    }
    if (!type) {
      throw new Error(`invalid $type "${val}"`);
    }
    return `attribute_type(${toName('$type', prop)}, `
      + `${ toValue(type, PropTypes.string) })`;
  }

  function $begins(val: any, prop?: TProp): string {
    return `begins_with(${toName('$begins', prop)}, `
      + `${ toValue(val, prop) })`;
  }

  function $contains(val: any, prop?: TProp): string {
    return `contains(${toName('$contains', prop)}, `
      + `${ toValue(val, prop, true) })`;
  }

  function $size(val: any, prop?: TProp): string {
    if (!prop) {
      throw new Error(`${val} missing context`);
    }
    return evalExpr(val, {
      ...prop,
      alias: `size(${prop.alias})`,
      type: TPropTokens.number,
      prefix: ''
    });
  }
}
