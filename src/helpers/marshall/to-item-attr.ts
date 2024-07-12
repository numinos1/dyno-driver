import { TPropTokens } from "@/types";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

/**
 * Convert Document to Item Attribute
 */
export function toItemAttr(
  value: any,
  type: TPropTokens,
  prefix?: string
): AttributeValue {
  if (typeof value === null) {
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
      else if (val[0] instanceof Buffer) {
        return { 'BS': val };
      }
      else {
        throw new Error(`Invalid Set value type "${typeof first}"`);
      }
    }
    case 'NS': {
      return {
        NS: [...value].map(val => `${val}`)
      };
    }
    case 'L': {
      return {
        // TODO - Hack to get recursive lists to marshall
        L: marshall(value) as any
      };
    }
    case 'M': {
      return {
        M: marshall(value)
      };
    }
    default: {
      return { NULL: true };
    }
  }
}