import { TProp, TPropTokens } from '../../src/types';

export const propList: TProp[] = [
  {
    name: 'id',
    alias: 'sk',
    prefix: 'DOC#',
    type: 'string',
    token: TPropTokens.string,
    isRequired: true,
    isKey: true,
    index: 0
  },
  {
    name: 'repoId',
    alias: 'pk',
    prefix: 'REPO#',
    type: 'string',
    token: TPropTokens.string,
    isRequired: true,
    isKey: true,
    index: 0
  },
  {
    name: 'version',
    alias: 'vid',
    prefix: '',
    type: 'string',
    token: TPropTokens.string,
    isRequired: true,
    isKey: false,
    index: 0
  },
  {
    name: 'encoding',
    alias: 'enc',
    prefix: '',
    type: 'string',
    token: TPropTokens.string,
    isRequired: true,
    isKey: false,
    index: 0
  },
  {
    name: 'status',
    alias: 'sta',
    prefix: '',
    type: 'string',
    token: TPropTokens.string,
    isRequired: true,
    isKey: false,
    index: 0
  },
  {
    name: 'createdBy',
    alias: 'cby',
    prefix: '',
    type: 'string',
    token: TPropTokens.string,
    isRequired: true,
    isKey: false,
    index: 0
  },
  {
    name: 'createdOn',
    alias: 'con',
    prefix: '',
    type: 'number',
    token: TPropTokens.number,
    isRequired: true,
    isKey: false,
    index: 0
  },
  {
    name: 'updatedBy',
    alias: 'uby',
    prefix: '',
    type: 'string',
    token: TPropTokens.string,
    isRequired: true,
    isKey: false,
    index: 0
  },
  {
    name: 'updatedOn',
    alias: 'uon', 
    prefix: '',
    type: 'number',
    token: TPropTokens.number,
    isRequired: true,
    isKey: false,
    index: 0
  },
  {
    name: 'deleteOn',
    alias: 'ttl',
    prefix: '',
    type: 'number',
    token: TPropTokens.number,
    isRequired: false,
    isKey: false,
    index: 0
  },
  {
    name: 'body',
    alias: 'bdy',
    prefix: '',
    type: 'binary',
    token: TPropTokens.binary,
    isRequired: false,
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

export const propsMock = new Map<string, TProp>(
  propList.map(prop => [prop.name, prop])
);

/**
 * Copy the Prop List
 */
export function newPropList(): TProp[] {
  return propList.map(prop => ({
    ...prop,
    isKey: false,
    isRequired: false,
    alias: prop.name,
  }));
}
