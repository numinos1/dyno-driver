import { TProp, TPropMap, TPropTokens } from '@/types';

export const prop5List: TProp[] = [
  {
    name: 'repoId',
    alias: 'pk',
    prefix: 'repo#',
    type: TPropTokens.string,
    isRequired: true,
    isStatic: false,
    isKey: true,
    index: 0
  },
  {
    name: 'docId',
    alias: 'sk',
    prefix: 'doc#',
    type: TPropTokens.string,
    isRequired: true,
    isStatic: false,
    isKey: true,
    index: 0
  },
  {
    name: 'isBig',
    alias: 'isBig',
    prefix: '',
    type: TPropTokens.boolean,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'alias',
    alias: 'alias',
    prefix: '',
    type: TPropTokens.string,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'total',
    alias: 'total',
    prefix: '',
    type: TPropTokens.number,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'ages',
    alias: 'ages',
    prefix: '',
    type: TPropTokens.list,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'names',
    alias: 'names',
    prefix: '',
    type: TPropTokens.list,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'list',
    alias: 'list',
    prefix: '',
    type: TPropTokens.list,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'colors',
    alias: 'colors', 
    prefix: '',
    type: TPropTokens.stringSet,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'years',
    alias: 'years',
    prefix: '',
    type: TPropTokens.numberSet,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'deleteOn',
    alias: 'deleteOn',
    prefix: '',
    type: TPropTokens.number,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'meta',
    alias: 'meta',
    prefix: '',
    type: TPropTokens.map,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'meta2',
    alias: 'meta2',
    prefix: '',
    type: TPropTokens.map,
    isRequired: true,
    isStatic: false,
    isKey: false,
    index: 0
  },
  {
    name: 'body',
    alias: 'body',
    prefix: '',
    type: TPropTokens.binary,
    isRequired: false,
    isStatic: false,
    isKey: false,
    index: 0
  },
];

export const props5Mock = new Map<string, TProp>(
  prop5List.map(prop => [prop.name, prop])
);

/**
 * Copy the Prop List
 */
export function newProp5List(): TProp[] {
  return prop5List.map(prop => ({
    ...prop,
    isKey: false,
    isRequired: false,
    alias: prop.name,
  }));
}

/**
 * Copy Props List to PropMap
 */
export function newProp5Map(): TPropMap {
  return prop5List.reduce((map, prop) =>
    map.set(prop.name, prop),
    new Map<string, TProp>()
  );
}