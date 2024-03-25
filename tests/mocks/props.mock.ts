import { TProp, TPropTokens } from '../../src/types';

export const propList: TProp[] = [
  {
    name: 'id',
    alias: 'sk',
    prefix: 'DOC#',
    type: 'string',
    token: TPropTokens.string,
    isRequired: true,
    isKey: true
  },
  {
    name: 'repoId',
    alias: 'pk',
    prefix: 'REPO#',
    type: 'string',
    token: TPropTokens.string,
    isRequired: true,
    isKey: true
  },
  {
    name: 'version',
    alias: 'vid',
    prefix: '',
    type: 'string',
    token: TPropTokens.string,
    isRequired: true,
    isKey: false
  },
  {
    name: 'encoding',
    alias: 'enc',
    prefix: '',
    type: 'string',
    token: TPropTokens.string,
    isRequired: true,
    isKey: false
  },
  {
    name: 'status',
    alias: 'sta',
    prefix: '',
    type: 'string',
    token: TPropTokens.string,
    isRequired: true,
    isKey: false
  },
  {
    name: 'createdBy',
    alias: 'cby',
    prefix: '',
    type: 'string',
    token: TPropTokens.string,
    isRequired: true,
    isKey: false
  },
  {
    name: 'createdOn',
    alias: 'con',
    prefix: '',
    type: 'number',
    token: TPropTokens.number,
    isRequired: true,
    isKey: false
  },
  {
    name: 'updatedBy',
    alias: 'uby',
    prefix: '',
    type: 'string',
    token: TPropTokens.string,
    isRequired: true,
    isKey: false
  },
  {
    name: 'updatedOn',
    alias: 'uon',
    prefix: '',
    type: 'number',
    token: TPropTokens.number,
    isRequired: true,
    isKey: false
  },
  {
    name: 'deleteOn',
    alias: 'ttl',
    prefix: '',
    type: 'number',
    token: TPropTokens.number,
    isRequired: false,
    isKey: false
  },
  {
    name: 'body',
    alias: 'bdy',
    prefix: '',
    type: 'binary',
    token: TPropTokens.binary,
    isRequired: false,
    isKey: false
  },
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
