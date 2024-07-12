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
        [type]: prefix
          ? `${prefix}${value}`
          : value
      };
    }
    case 'N': {
      return {
        [type]: prefix
          ? `${prefix}${value}`
          : `${value}`
      };
    }
    case 'B': {
      return {
        [type]: value
      };
    }
    case 'BOOL': {
      return {
        [type]: value
      };
    }
    case 'BS': {
      return {
        [type]: [...value]
      };
    }
    case 'SS': {
      return {
        [type]: [...value]
      };
    }
    case 'NS': {
      return {
        [type]: [...value].map(val => `${val}`)
      };
    }
    case 'L': {
      return {
        [type]: value.map(marshall)
      };
    }
    case 'M': {
      return {
        [type]: marshall(value)
      };
    }
    default: {
      return { NULL: true };
    }
  }
}