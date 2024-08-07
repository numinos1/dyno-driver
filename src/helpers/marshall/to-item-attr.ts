import { TPropTokens } from "@/types";
import { AttributeValue } from "@aws-sdk/client-dynamodb";

/**
 * Convert Document to Item Attribute
 */
export function toItemAttr(
  value: any,
  type: TPropTokens,
  prefix?: string
): AttributeValue {
  if (value === null) {
    return { NULL: true };
  }
  switch (type) {
    case 'S': {
      return {
        S: prefix
          ? `${prefix}${value}`
          : value
      };
    }
    case 'N': {
      return {
        N: prefix
          ? `${prefix}${value}`
          : `${value}`
      };
    }
    case 'B': {
      return {
        B: new Uint8Array(value)
      };
    }
    case 'BOOL': {
      return { BOOL: value };
    }
    case 'SS': {
      const val = [...value];
      const first = val[0];

      if (typeof first === 'string') {
        return { 'SS': val };
      }
      if (typeof first === 'number') {
        return { 'NS': val.map(v => `${v}`) };
      }
      if (val[0] instanceof Buffer) {
        return { 'BS': val };
      }
      throw new Error(`Invalid Set value type "${typeof first}"`);
    }
    case 'NS': {
      return {
        NS: [...value].map(val => `${val}`)
      };
    }
    case 'BS': {
      return {
        BS: [...value].map(val => val)
      };
    }
    case 'L': {
      if (!Array.isArray) {
        throw new Error(`Invalid list type "${typeof value}"`)
      }
      return {
        L: value.map(toPropAttr)
      };
    }
    case 'M': {
      return {
        M: Object.entries(value).reduce((out, [key, val]) => {
          out[key] = toPropAttr(val);
          return out;
        }, {})
      };
    }
    default: {
      return { NULL: true };
    }
  }
}

/**
 * Convert 
 */
function toPropAttr(value: any): AttributeValue {
  switch (typeof value) {
    case 'undefined':
      return undefined;
    case 'number':
      return toItemAttr(value, TPropTokens.number);
    case 'string':
      return toItemAttr(value, TPropTokens.string);
    case 'boolean':
      return toItemAttr(value, TPropTokens.boolean);
    case 'object':
      if (Array.isArray(value)) {
        return toItemAttr(value, TPropTokens.list);
      }
      if (value instanceof Buffer) {
        return toItemAttr(value, TPropTokens.binary);
      }
      if (value instanceof Set) {
        return toItemAttr(value, TPropTokens.stringSet);
      }
      return toItemAttr(value, TPropTokens.map);
    default:
      return undefined;
  }
}