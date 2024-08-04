import { AttributeValue } from "@aws-sdk/client-dynamodb";
/**
 * Convert Value to a Query Attribute
 */
export function toQueryAttr(
  value: any,
  prefix: string = ''
): AttributeValue {
  const type = typeof value;

  if (type === 'string') {
    return { S: `${prefix}${value}` };
  }
  if (type === 'number') {
    return { N: `${prefix}${value}` };
  }
  if (type === 'boolean') {
    return { BOOL: value };
  }
  if (!value) {
    return { NULL: true };
  }
  if (type === 'object') {
    if (Array.isArray(value)) {
      return { L: value.map(v => toQueryAttr(v)) };
    }
    if (value instanceof Buffer) {
      return { B: value };
    }
    if (value instanceof Set) {
      const list = [...value];
      const first = value[0];

      if (typeof first === 'string') {
        return { 'SS': list };
      }
      if (typeof first === 'number') {
        return { 'NS': list.map(v => `${v}`) };
      }
      else if (first instanceof Buffer) {
        return { 'BS': list };
      }
      else {
        throw new Error(`Invalid Set values ${value}`);
      }
    }
    return {
      M: Object.entries(value).reduce(
        (out, [key, val]) => {
          out[key] = toQueryAttr(val);
          return out;
        },
        {}
      )
    };
  }
  throw new Error(`Invalid query value ${value}`);
}