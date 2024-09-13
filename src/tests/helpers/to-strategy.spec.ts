import { EntityMock } from '../mocks/entity.mock';
import { Entity6Mock } from '../mocks/entity-6.mock';
import { propsMock } from '../mocks/props.mock';
import { describe, expect, it } from '@jest/globals';
import { TQueryType, toStrategy } from '@/helpers/to-strategy';

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
            name: 'testTable',
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
            name: 'testTable',
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
          body: Buffer.from('xxxxxxx')
        },
        [
          {
            name: 'testTable',
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
          body: Buffer.from('xxxxxxx')
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
            name: 'testTable',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          },
          {
            name: 'testTable-gsi-1',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          },
          {
            name: 'testTable-gsi-2',
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
            name: 'testTable',
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
          '__pk': 'abcd1234'
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
            name: 'testTable',
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
          '__pk': 'abcd1234'
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
            name: 'testTable',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          },
          {
            name: 'testTable-gsi-1',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          },
          {
            name: 'testTable-gsi-2',
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
          '__vid': 'abcd1234',
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
            name: 'testTable',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          },
          {
            name: 'testTable-gsi-1',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          },
          {
            name: 'testTable-gsi-2',
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
          '__sk': 'abcd1234',
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
            name: 'testTable',
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
          '__pk': 'abcd1234',
          '__sk': { $gt: 'efgh5678' }
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
            name: 'testTable',
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
          '__pk': 'abcd1234',
          '__sk': { $gt: 'efgh5678' }
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
            name: 'testTable',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          },
          {
            name: 'testTable-gsi-1',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          },
          {
            name: 'testTable-gsi-2',
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
          propsMock.get('version'),
          propsMock.get('id')
        ],
        table: 'testTable',
        index: 'testTable-gsi-2',
        query: {
          '__vid': 'abcd1234',
          '__sk': { $gt: 'efg567' },
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
            name: 'testTable',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          },
          {
            name: 'testTable-gsi-1',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          }, 
          {
            name: 'testTable-gsi-2',
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
          '__sk': 'abcd1234',
          '__pk': { $gt: 'efg567' },
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
            name: 'testTable',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.getItem,
        keys: [
          propsMock.get('repoId'),
          propsMock.get('id')
        ],
        table: 'testTable',
        index: undefined,
        query: {
          '__pk': 'abcd1234',
          '__sk': 'efgh5678'
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
            name: 'testTable',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.getItem,
        keys: [
          propsMock.get('repoId'),
          propsMock.get('id')
        ],
        table: 'testTable',
        index: undefined,
        query: {
          '__pk': 'abcd1234',
          '__sk': 'efgh5678'
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
            name: 'testTable',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          }, 
          {
            name: 'testTable-gsi-1',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          },
          {
            name: 'testTable-gsi-2',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('version'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.getItem,
        keys: [
          propsMock.get('repoId'),
          propsMock.get('id')
        ],
        table: 'testTable',
        index: undefined,
        query: {
          '__pk': 'abcd1234',
          '__sk': 'efgh5678'
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
            name: 'testTable',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          },
          {
            name: 'testTable-gsi-1',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          }, 
          {
            name: 'testTable-gsi-2',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('version'),
            sk: propsMock.get('id')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.getItem,
        keys: [
          propsMock.get('repoId'),
          propsMock.get('id')
        ],
        table: 'testTable',
        index: undefined,
        query: {
          '__pk': 'abcd1234',
          '__sk': 'efgh5678'
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
            name: 'testTable',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          }, 
          {
            name: 'testTable-gsi-1',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('id'),
            sk: propsMock.get('repoId')
          }, 
          {
            name: 'testTable-gsi-2',
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
          propsMock.get('version'),
          propsMock.get('id')
        ],
        table: 'testTable',
        index: 'testTable-gsi-2',
        query: {
          '__sk': 'efgh5678',
          '__vid': 'abcd1234',
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
            name: 'testTable',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('id')
          },
          {
            name: 'testTable-gsi-1',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('version')
          },
          {
            name: 'testTable-gsi-2',
            wcu: 0,
            rcu: 0,
            project: [],
            pk: propsMock.get('repoId'),
            sk: propsMock.get('createdOn')
          }
        ],
        'testTable'
      )).toEqual({
        type: TQueryType.skQuery,
        keys: [
          propsMock.get('repoId'),
          propsMock.get('createdOn')
        ],
        table: 'testTable',
        index: 'testTable-gsi-2',
        query: {
          __pk: 'abcd1234',
          __con: 1232423452,
        },
        filter: {
          version: { $gt: 'efg567' },
        },
      });
    });
  
  });

  // ----------------------------------------------------------------
  //    Get Query
  // ----------------------------------------------------------------

  // describe('STATIC_PK', () => {

  //   it('identifies static primary key', () => {
  //     expect(toStrategy<Entity6Mock>(
  //       {
  //         id: 'efgh5678'
  //       },
  //       [
  //         {
  //           name: 'testTable',
  //           wcu: 0,
  //           rcu: 0,
  //           project: [],
  //           pk: propsMock.get('repoId'),
  //           sk: propsMock.get('id')
  //         }
  //       ],
  //       'testTable'
  //     )).toEqual({
  //       type: TQueryType.getItem,
  //       keys: [
  //         propsMock.get('repoId'),
  //         propsMock.get('id')
  //       ],
  //       table: 'testTable',
  //       index: undefined,
  //       query: {
  //         '__pk': 'abcd1234',
  //         '__sk': 'efgh5678'
  //       },
  //       filter: {},
  //     });
  // });

});