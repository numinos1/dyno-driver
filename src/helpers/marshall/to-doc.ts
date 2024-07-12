import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { TProp } from '@/types';

export type TItem = Record<string, AttributeValue>;

/**
 * Convert a Dynamo record to a document
 */
export function toDoc<Type>(
  Item: TItem,
  props: TProp[],
  propCount: number,
): Type {
  const Doc = {};

  for (let i = 0; i < propCount; ++i) {
    const { prefix, name, alias } = props[i];
    const attrVal = Item[alias];

    if (attrVal) {
      const val = toAttr(attrVal, prefix);

      if (val !== undefined) {
        Doc[name] = val;
      }
    }
  }
  return Doc as Type;
}

/**
 * Convert a Dynamo attribute to a value
 */
export function toAttr(entry: AttributeValue, prefix?: string) {
  const kvpair = Object.entries(entry)[0];
  const type = kvpair[0];
  const value = kvpair[1] as unknown;

  switch (type) {
    case 'B': {
      const val = value as Uint8Array;
      
      return Buffer.from(val);
    }
    case 'BOOL': {
      return value;
    }
    case 'NULL': {
      return null;
    }
    case 'N': {
      let val = value as string;

      if (prefix) {
        val = val.substring(prefix.length);
      }
      return +val;
    }
    case 'S': {
      let val = value as string;

      if (prefix) {
        val = val.substring(prefix.length);
      }
      return val;
    }
    case 'BS': {
      const list = value as Buffer[];
      const len = list.length;
      const out = new Set<Buffer>();

      for (let i = 0; i < len; ++i) {
        out.add(list[i]);
      }
      return out;
    }
    case 'SS': {
      const list = value as string[];
      const len = list.length;
      const out = new Set<string>();

      for (let i = 0; i < len; ++i) {
        out.add(list[i]);
      }
      return out;
    }
    case 'NS': {
      const list = value as string[];
      const len = list.length;
      const out = new Set();

      for (let i = 0; i < len; ++i) {
        out.add(+list[i]);
      }
      return out;
    }
    case 'L': {
      const list = value as AttributeValue[];
      const len = list.length;      
      const out = [];

      for (let i = 0; i < len; ++i) {
        out[i] = toAttr(list[i]);
      }
      return out;
    }
    case 'M': {
      const object = value as AttributeValue;
      const out = {};

      for (let key in object) {
        out[key] = toAttr(value[key]);
      }
      return out;
    }
    default: {
      return undefined;
    }
  }
}