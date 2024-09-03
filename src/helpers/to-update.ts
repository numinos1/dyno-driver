import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { toQueryAttr } from "./marshall/to-query-attr";

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
 
// ------------------------------------------------------------------
//      Type Definitions
// ------------------------------------------------------------------

type TUpdateClause = (prop: string, value: any, prefix: string) => string;

// ------------------------------------------------------------------
//      Update Method
// ------------------------------------------------------------------

/**
 * Render an Update Expression
 */
export function toUpdate(update: any): string {
  let count = 0;
  const names: Record<string, string> = {};
  const values: Record<string, AttributeValue> = {}; 
  const sets: string[] = [];
  const removes: string[] = [];
  const adds: string[] = [];
  const deletes: string[] = [];

  const $clauses: TUpdateClause = {
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
  Object.entries(update).forEach(([clause, values]) => {
    const $clause = $clauses[clause];

    if (!$clause) {
      throw new Error(`Invalid update clause: "${clause}" `);
    }
    if (!values || typeof values !== 'object') {
      throw new Error(`Invalid update object for: "${clause}"`);
    }
    Object.entries(values).forEach(([prop, attrs]) => {
      $clause(
    });
  });

  // ------------------------------------------------------
  //      Helper Methods
  // ------------------------------------------------------

  /**
   * Generate next token
   */
  function toToken(prefix) {
    return prefix
      + alphabet[Math.floor(count / 26)]
      + alphabet[count++ % 26];
  }

  function toName(prop) {
    const key = toToken('#');
    names[key] = prop;
    return key;
  }

  function toValue(value, prefix) {
    const key = toToken(':');
    values[key] = toQueryAttr(value, prefix);
    return key;
  }

  // ------------------------------------------------------
  //      Update Clauses
  // ------------------------------------------------------

  function $create(prop, value, prefix) {
    const nkey = toName(prop);
    const vkey = toValue(value, prefix);
    sets.push(`${nkey} = if_not_exists(${nkey}, ${vkey}`);
  }

  function $set(prop, value, prefix) {
    const nkey = toName(prop);
    const vkey = toValue(value, prefix);
    sets.push(`${nkey} = ${vkey}`);
  }

  function $unset(prop, value, prefix) {
    const nkey = toName(prop);
    removes.push(nkey);
  }

  function $setPath(prop, value, prefix) {
    const nkey = toName(`${prop}.${value.path}`);
    const vkey = toValue(value.value, prefix);
    sets.push(`${nkey} = ${vkey}`);
  }

  function $unsetPath(prop, value, prefix) {
    const nkey = toName(`${prop}.${value.path}`);
    deletes.push(nkey);
  }

  function $setIndex(prop, value, prefix) {
    const nkey = toName(`${prop}[${value.index}]`);
    const vkey = toValue(value.value, prefix);
    sets.push(`${nkey} = ${vkey}`);
  }

  function $unsetIndex(prop, value, prefix) {
    const nkey = toName(`${prop}[${value.index}]`);
    deletes.push(nkey);
  }

  function $append(prop, value, prefix) {
    const nkey = toName(prop);
    const vkey = toValue(value, prefix);
    sets.push(`${nkey} = list_append(${nkey}, ${vkey})`);
  }

  function $prepend(prop, value, prefix) {
    const nkey = toName(prop);
    const vkey = toValue(value, prefix);
    sets.push(`${nkey} = list_append(${vkey}, ${nkey})`);
  }

  function $increment(prop, value, prefix) {
    const nkey = toName(prop);
    const vkey = toValue(value, prefix);
    sets.push(`${nkey} = ${nkey} + ${vkey}`);
  }

  function $decrement(prop, value, prefix) {
    const nkey = toName(prop);
    const vkey = toValue(value, prefix);
    sets.push(`${nkey} = ${nkey} - ${vkey}`);
  }

  function $add(prop, value, prefix) {
    const nkey = toName(prop);
    const vkey = toValue(value, prefix);
    adds.push(`${nkey} ${vkey}`);
  }

  function $delete(prop, value, prefix) {
    const nkey = toName(prop);
    const vkey = toValue(value, prefix);
    deletes.push(`${nkey} ${vkey}`);
  }

}