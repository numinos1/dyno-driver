import { EntityMock } from '../mocks/entity.mock';
import { propsMock } from '../mocks/props.mock';
import { describe, expect, it } from '@jest/globals';
import { TQueryType, toStrategy } from '@/helpers/to-strategy';
import { TProp } from '@/types';

/**
 * Helper to convert TProp to string[][]
 */
function toNames(keys: TProp[][]): string[][] {
  return keys.map(key => key.map(k => k.name));
}

/**
 * Tests
 */
describe('toStrategy()', () => {

  it('is a function', () => {
    expect(typeof toStrategy)
      .toEqual('function');
  });

  // ----------------------------------------------------------------
  //    Table Scan
  // ----------------------------------------------------------------

  describe('TABLE_SCAN', () => {

    it('no expression', () => {
      expect(toStrategy<EntityMock>(
        {},
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        filter: {},
        query: {},
        keys: [],
        table: 'testTable',
        index: undefined,
        type: 0
      });
    });

    // ----------------------------------------------------------------

    it('pk', () => {
      expect(toStrategy<EntityMock>(
        {
          id: '1234abcd'
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        filter: {
          id: '1234abcd'
        },
        query: {},
        keys: [],
        table: 'testTable',
        index: undefined,
        type: 0
      });
    });

    // ----------------------------------------------------------------

    it('props', () => {
      expect(toStrategy<EntityMock>(
        {
          version: 'abcd1234',
          encoding: 'JSON',
          status: 'active',
          createdOn: 1232133213,
          createdBy: 'andrew',
          updatedOn: 1232132422,
          updatedBy: 'andrew',
          deleteOn: 1231232131,
          body: 'xxxxxxx'
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        filter: {
          version: 'abcd1234',
          encoding: 'JSON',
          status: 'active',
          createdOn: 1232133213,
          createdBy: 'andrew',
          updatedOn: 1232132422,
          updatedBy: 'andrew',
          deleteOn: 1231232131,
          body: 'xxxxxxx'
        },
        query: {},
        keys: [],
        table: 'testTable',
        index: undefined,
        type: 0
      });
    });

    // ----------------------------------------------------------------

    it('no props + GSIs', () => {
      expect(toStrategy<EntityMock>(
        {},
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          },
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          },
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('version'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        filter: {},
        query: {},
        keys: [],
        table: 'testTable',
        index: undefined,
        type: 0
      });
    });

  });
    
  // ----------------------------------------------------------------
  //    Primary Key Query
  // ----------------------------------------------------------------

  describe('PK_QUERY', () => {

    it('pk', () => {
      expect(toStrategy<EntityMock>(
        {
          repoId: 'abcd1234'
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.pkQuery,
        keys: [
          propsMock.get('repoId')
        ],
        table: 'testTable',
        index: undefined,
        query: {
          repoId: 'abcd1234'
        },
        filter: {},
      });
    });

    // ----------------------------------------------------------------

    it('pk + props', () => {
      expect(toStrategy<EntityMock>(
        {
          version: 'abcd1234',
          encoding: 'JSON',
          status: 'active',
          repoId: 'abcd1234'
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.pkQuery,
        keys: [
          propsMock.get('repoId')
        ],
        table: 'testTable',
        index: undefined,
        query: {
          repoId: 'abcd1234'
        },
        filter: {
          version: 'abcd1234',
          encoding: 'JSON',
          status: 'active',
        },
      });
    });

    // ----------------------------------------------------------------

    it('pk2 + props', () => {
      expect(toStrategy<EntityMock>(
        {
          version: 'abcd1234',
          createdOn: 1232423452,
          encoding: 'JSON',
          status: 'active',
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          },
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          },
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('version'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.pkQuery,
        keys: [
          propsMock.get('version')
        ],
        table: 'testTable',
        index: 'testTable-gsi-2',
        query: {
          version: 'abcd1234',
        },
        filter: {
          createdOn: 1232423452,
          encoding: 'JSON',
          status: 'active',
        },
      });
    });

    // ----------------------------------------------------------------

    it('pk2 + props (pk2 = sk)', () => {
      expect(toStrategy<EntityMock>(
        {
          id: 'abcd1234',
          createdOn: 1232423452
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          },
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          },
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('version'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.pkQuery,
        keys: [
          propsMock.get('id')
        ],
        table: 'testTable',
        index: 'testTable-gsi-1',
        query: {
          id: 'abcd1234',
        },
        filter: {
          createdOn: 1232423452
        },
      });
    });

  });

  // ----------------------------------------------------------------
  //    Secondary Key Query
  // ----------------------------------------------------------------

  describe('SK_QUERY', () => {
      
    it('pk + sk/$exp', () => {
      expect(toStrategy<EntityMock>(
        {
          repoId: 'abcd1234',
          id: { $gt: 'efgh5678' }
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.skQuery,
        keys: [
          propsMock.get('repoId'),
          propsMock.get('id')
        ],
        table: 'testTable',
        index: undefined,
        query: {
          repoId: 'abcd1234',
          id: { $gt: 'efgh5678' }
        },
        filter: {},
      });
    });

    // ----------------------------------------------------------------

    it('pk + sk/$exp + props', () => {
      expect(toStrategy<EntityMock>(
        {
          repoId: 'abcd1234',
          id: { $gt: 'efgh5678' },
          version: 'abcd1234',
          encoding: 'JSON',
          status: 'active',
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.skQuery,
        keys: [
          propsMock.get('repoId'),
          propsMock.get('id')
        ],
        table: 'testTable',
        index: undefined,
        query: {
          repoId: 'abcd1234',
          id: { $gt: 'efgh5678' }
        },
        filter: {
          version: 'abcd1234',
          encoding: 'JSON',
          status: 'active',
        },
      });
    });

    // ----------------------------------------------------------------

    it('pk2 + sk2/$exp + props', () => {
      expect(toStrategy<EntityMock>(
        {
          version: 'abcd1234',
          id: { $gt: 'efg567' },
          encoding: 'JSON',
          status: 'active',
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          },
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          },
          { wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('version'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.skQuery,
        keys: [
          propsMock.get('version'),
          propsMock.get('id')
        ],
        table: 'testTable',
        index: 'testTable-gsi-2',
        query: {
          version: 'abcd1234',
          id: { $gt: 'efg567' },
        },
        filter: {
          encoding: 'JSON',
          status: 'active',
        },
      });
    });

    // ----------------------------------------------------------------

    it('pk1 + sk1/$exp + props', () => {
      expect(toStrategy<EntityMock>(
        {
          id: 'abcd1234',
          repoId: { $gt: 'efg567' },
          createdOn: 1232423452
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          },
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          }, 
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('version'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.skQuery,
        keys: [
          propsMock.get('id'),
          propsMock.get('repoId')
        ],
        table: 'testTable',
        index: 'testTable-gsi-1',
        query: {
          id: 'abcd1234',
          repoId: { $gt: 'efg567' },
        },
        filter: {
          createdOn: 1232423452
        },
      });
    }); 

  });

  // ----------------------------------------------------------------
  //    Get Query
  // ----------------------------------------------------------------

  describe('GET_QUERY', () => {

    it('pk + sk', () => {
      expect(toStrategy<EntityMock>(
        {
          repoId: 'abcd1234',
          id: 'efgh5678'
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.get,
        keys: [
          propsMock.get('repoId'),
          propsMock.get('id')
        ],
        table: 'testTable',
        index: undefined,
        query: {
          repoId: 'abcd1234',
          id: 'efgh5678'
        },
        filter: {},
      });
    });

    // ----------------------------------------------------------------

    it('pk + sk + props', () => {
      expect(toStrategy<EntityMock>(
        {
          repoId: 'abcd1234',
          id: 'efgh5678',
          version: 'abcd1234',
          encoding: 'JSON',
          status: 'active',
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.get,
        keys: [
          propsMock.get('repoId'),
          propsMock.get('id')
        ],
        table: 'testTable',
        index: undefined,
        query: {
          repoId: 'abcd1234',
          id: 'efgh5678'
        },
        filter: {
          version: 'abcd1234',
          encoding: 'JSON',
          status: 'active',
        },
      });
    });

    // ----------------------------------------------------------------

    it('pk + sk (with-full-gsi-overlap)', () => {
      expect(toStrategy<EntityMock>(
        {
          repoId: 'abcd1234',
          id: 'efgh5678'
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          }, 
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          },
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('version'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.get,
        keys: [
          propsMock.get('repoId'),
          propsMock.get('id')
        ],
        table: 'testTable',
        index: undefined,
        query: {
          repoId: 'abcd1234',
          id: 'efgh5678'
        },
        filter: {},
      });
    });

    // ----------------------------------------------------------------

    it('pk1 + sk1 (with-full-reverse-gsi-overlap)', () => {
      expect(toStrategy<EntityMock>(
        {
          id: 'efgh5678',
          repoId: 'abcd1234',
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          },
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          }, 
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('version'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.get,
        keys: [
          propsMock.get('repoId'),
          propsMock.get('id')
        ],
        table: 'testTable',
        index: undefined,
        query: {
          repoId: 'abcd1234',
          id: 'efgh5678'
        },
        filter: {},
      });
    });

    // ----------------------------------------------------------------

    it('pk2 + pk2 (with-partial-overlap)', () => {
      expect(toStrategy<EntityMock>(
        {
          id: 'efgh5678',
          version: 'abcd1234',
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          }, 
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          }, 
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('version'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.get,
        keys: [
          propsMock.get('version'),
          propsMock.get('id')
        ],
        table: 'testTable',
        index: 'testTable-gsi-2',
        query: {
          id: 'efgh5678',
          version: 'abcd1234',
        },
        filter: {},
      });
    });

    // ----------------------------------------------------------------

    it('pk2 + sk2 + props (with-multiple-overlaps)', () => {
      expect(toStrategy<EntityMock>(
        {
          repoId: 'abcd1234',
          version: { $gt: 'efg567' },
          createdOn: 1232423452
        },
        [
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          },
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('version')
          },
          {
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('createdOn')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.get,
        keys: [
          propsMock.get('repoId'),
          propsMock.get('createdOn')
        ],
        table: 'testTable',
        index: 'testTable-gsi-2',
        query: {
          repoId: 'abcd1234',
          createdOn: 1232423452
        },
        filter: {
          version: { $gt: 'efg567' },
        },
      });
    });
  
  });

});