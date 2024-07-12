import { AttributeValue } from "@aws-sdk/client-dynamodb";

/**
 * Convert a Dynamo attribute to a value
 */
export function toDocAttr
(entry: AttributeValue, prefix?: string): any {
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
        out[i] = toDocAttr
        (list[i]);
      }
      return out;
    }
    case 'M': {
      const object = value as AttributeValue;
      const out = {};

      for (let key in object) {
        out[key] = toDocAttr
        (value[key]);
      }
      return out;
    }
    default: {
      return undefined;
    }
  }
}