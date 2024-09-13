import { TProp, TPropMap, TPropTokens } from '@/types';

export const prop6List: TProp[] = [
  {
    name: '',
    alias: 'pk',
    prefix: 'USER#',
    type: TPropTokens.string,
    isRequired: false,
    isStatic: true,
    isKey: true,
    index: 0
  },
  {
    name: 'id',
    alias: 'sk',
    prefix: '',
    type: TPropTokens.string,
    isRequired: true,
    isStatic: false,
    isKey: true,
    index: 0
  },
  {
    name: '',
    alias: 'pk1',
    prefix: 'USER#',
    type: TPropTokens.string,
    isRequired: false,
    isStatic: true,
    isKey: true,
    index: 1
  },
  {
    name: 'sk1',
    alias: 'hsh',
    prefix: '',
    type: TPropTokens.string,
    isRequired: true,
    isStatic: true,
    isKey: true,
    index: 1
  },
  {
    name: 'encoding',
    alias: 'enc',
    prefix: '',
    type: TPropTokens.string,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'status',
    alias: 'sta',
    prefix: '',
    type: TPropTokens.string,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'createdBy',
    alias: 'cby',
    prefix: '',
    type: TPropTokens.string,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'createdOn',
    alias: 'con',
    prefix: '',
    type: TPropTokens.number,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'updatedBy',
    alias: 'uby',
    prefix: '',
    type: TPropTokens.string,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'updatedOn',
    alias: 'uon', 
    prefix: '',
    type: TPropTokens.number,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'deleteOn',
    alias: 'ttl',
    prefix: '',
    type: TPropTokens.number,
    isRequired: false,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'body',
    alias: 'bdy',
    prefix: '',
    type: TPropTokens.binary,
    isRequired: false,
    isStatic: false,
    isKey: false,
    index: 0
  },
  // Don't add GSI Entries for Test
  // {
  //   name: 'repoId',
  //   alias: 'pk1',
  //   prefix: '',
  //   type: 'string',
  //   token: TPropTokens.string,
  //   isRequired: false,
  //   isKey: true,
  //   index: 1
  // },
  // {
  //   name: 'version',
  //   alias: 'sk1',
  //   prefix: '',
  //   type: 'string',
  //   token: TPropTokens.string,
  //   isRequired: false,
  //   isKey: true,
  //   index: 1
  // },
];

export const props6Mock = new Map<string, TProp>(
  prop6List.map(prop => [prop.name, prop])
);

/**
 * Copy the Prop List
 */
export function newProp6List(): TProp[] {
  return prop6List.map(prop => ({
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
  return prop6List.reduce((map, prop) =>
    map.set(prop.name, prop),
    new Map<string, TProp>()
  );
}