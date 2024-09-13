import { TIndex, TProp, TPropMap, TPropTokens } from '@/types';

export const TableIndex6: TIndex[] = [
  {
    "name": "delta-sync",
    "pk": {
      "name": "__pk",
      "alias": "pk",
      "prefix": "USER#",
      "type": TPropTokens.string,
      "isStatic": true,
      "isRequired": false,
      "isKey": true,
      "index": 0
    },
    "sk": {
      "name": "id",
      "alias": "sk",
      "type": TPropTokens.string,
      "prefix": "",
      "isRequired": true,
      "isStatic": false,
      "isKey": true,
      "index": 0
    },
    "wcu": 0,
    "rcu": 0,
    "project": []
  },
  {
    "name": "delta-sync-gsi-1",
    "pk": {
      "name": "__pk1",
      "alias": "pk1",
      "prefix": "USER#",
      "type": TPropTokens.string,
      "isStatic": true,
      "isRequired": false,
      "isKey": true,
      "index": 1
    },
    "sk": {
      "name": "emailHash",
      "alias": "sk1",
      "type": TPropTokens.string,
      "prefix": "",
      "isRequired": false,
      "isStatic": false,
      "isKey": true,
      "index": 1
    },
    "wcu": 0,
    "rcu": 0,
    "project": []
  }
];

export const propStack6: TProp[] = [
  {
    "name": "id",
    "alias": "sk",
    "type": TPropTokens.string,
    "prefix": "",
    "isRequired": true,
    "isStatic": false,
    "isKey": true,
    "index": 0
  },
  {
    "name": "emailHash",
    "alias": "sk1",
    "type": TPropTokens.string,
    "prefix": "",
    "isRequired": false,
    "isStatic": false,
    "isKey": true,
    "index": 1
  },
  {
    "name": "slug",
    "alias": "slg",
    "type": TPropTokens.string,
    "prefix": "",
    "isRequired": false,
    "isStatic": false,
    "isKey": false,
    "index": 0
  },
  {
    "name": "first",
    "alias": "fst",
    "type": TPropTokens.string,
    "prefix": "",
    "isRequired": false,
    "isStatic": false,
    "isKey": false,
    "index": 0
  },
  {
    "name": "last",
    "alias": "lst",
    "type": TPropTokens.string,
    "prefix": "",
    "isRequired": false,
    "isStatic": false,
    "isKey": false,
    "index": 0
  },
  {
    "name": "email",
    "alias": "eml",
    "type": TPropTokens.string,
    "prefix": "",
    "isRequired": false,
    "isStatic": false,
    "isKey": false,
    "index": 0
  },
  {
    "name": "password",
    "alias": "pas",
    "type": TPropTokens.string,
    "prefix": "",
    "isRequired": false,
    "isStatic": false,
    "isKey": false,
    "index": 0
  },
  {
    "name": "image",
    "alias": "img",
    "type": TPropTokens.string,
    "prefix": "",
    "isRequired": false,
    "isStatic": false,
    "isKey": false,
    "index": 0
  },
  {
    "name": "role",
    "alias": "rol",
    "type": TPropTokens.string,
    "prefix": "",
    "isRequired": false,
    "isStatic": false,
    "isKey": false,
    "index": 0
  },
  {
    "name": "status",
    "alias": "sta",
    "type": TPropTokens.string,
    "prefix": "",
    "isRequired": false,
    "isStatic": false,
    "isKey": false,
    "index": 0
  },
  {
    "name": "createdOn",
    "alias": "con",
    "type": TPropTokens.number,
    "prefix": "",
    "isRequired": false,
    "isStatic": false,
    "isKey": false,
    "index": 0
  },
  {
    "name": "updatedOn",
    "alias": "uon",
    "type": TPropTokens.number,
    "prefix": "",
    "isRequired": false,
    "isStatic": false,
    "isKey": false,
    "index": 0
  },
  {
    "name": "__pk",
    "alias": "pk",
    "prefix": "USER#",
    "type": TPropTokens.string,
    "isStatic": true,
    "isRequired": false,
    "isKey": true,
    "index": 0
  },
  {
    "name": "__pk1",
    "alias": "pk1",
    "prefix": "USER#",
    "type": TPropTokens.string,
    "isStatic": true,
    "isRequired": false,
    "isKey": true,
    "index": 1
  }
];

export const props6Mock = new Map<string, TProp>(
  propStack6.map(prop => [prop.name, prop])
);

/**
 * Copy the Prop List
 */
export function newProp6List(): TProp[] {
  return propStack6.map(prop => ({
    ...prop,
    isKey: false,
    isRequired: false,
    alias: prop.name,
  }));
}

/**
 * Copy Props List to PropMap
 */
export function newProp6Map(): TPropMap {
  return propStack6.reduce((map, prop) =>
    map.set(prop.name, prop),
    new Map<string, TProp>()
  );
}