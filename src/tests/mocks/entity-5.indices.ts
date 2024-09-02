import { TIndex, TPropTokens } from "@/types";

// { pk: 'repo#repoId', sk: 'doc#docId' }, 
// { pk: 'doc#docId', sk: 'REPO#', },
// { pk: 'alias', sk: 'ALIAS#' },
// { pk: 'repo#repoId', sk: 'total' }

/**
 * Table Index for Entity 5
 */
export const tableIndex: TIndex[] = [
  {
    name: 'tableName',
    pk: {
      name: 'repoId',
      alias: 'pk',
      type: TPropTokens.string,
      prefix: 'repo#',
      isRequired: true,
      isStatic: false,
      isKey: true,
      index: 0
    },
    sk: {
      name: 'docId',
      alias: 'sk',
      type: TPropTokens.string,
      prefix: 'doc#',
      isRequired: true,
      isStatic: false,
      isKey: true,
      index: 0
    },
    wcu: 0,
    rcu: 0,
    project: []
  },
  {
    name: 'tableName-gsi-1',
    pk: {
      name: 'docId',
      alias: 'pk1',
      type: TPropTokens.string,
      prefix: 'doc#',
      isRequired: false,
      isStatic: false,
      isKey: true,
      index: 1
    },
    sk: {
      name: '',
      alias: 'sk1',
      type: TPropTokens.string,
      prefix: 'repo#',
      isRequired: false,
      isStatic: true,
      isKey: true,
      index: 1
    },
    wcu: 0,
    rcu: 0,
    project: []
  },
  {
    name: 'tableName-gsi-2',
    pk: {
      name: 'alias',
      alias: 'pk2',
      type: TPropTokens.string,
      prefix: '',
      isRequired: false,
      isStatic: false,
      isKey: true,
      index: 2
    },
    sk: {
      name: '',
      alias: 'sk2',
      type: TPropTokens.string,
      prefix: 'ALIAS#',
      isRequired: false,
      isStatic: true,
      isKey: true,
      index: 2
    },
    wcu: 0,
    rcu: 0,
    project: []
  },
  {
    name: 'tableName-gsi-3',
    pk: {
      name: 'repoId',
      alias: 'pk3',
      type: TPropTokens.string,
      prefix: 'repo#',
      isRequired: false,
      isStatic: false,
      isKey: true,
      index: 3
    },
    sk: {
      name: 'total',
      alias: 'sk3',
      type: TPropTokens.number,
      prefix: '',
      isRequired: false,
      isStatic: false,
      isKey: true,
      index: 3
    },
    wcu: 0,
    rcu: 0,
    project: []
  },
];