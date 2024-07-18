import { propsMock } from '../mocks/props.mock';
import { describe, expect, it } from '@jest/globals';
import { toExpression } from '@/helpers/to-expression';
import { EntityMock } from '@/tests/mocks/entity.mock';


describe('toExpression()', () => {

  it('is a function', () => {
    expect(typeof toExpression)
      .toEqual('function');
  });

  // ----------------------------------------------------------------

  it('empty query', () => {
    const names = {}, values = {};
    const expr = toExpression<EntityMock>({}, propsMock, names, values);

    expect(expr).toEqual(undefined);
    expect(names).toEqual({});
    expect(values).toEqual({});
  });

  // ----------------------------------------------------------------

  it('object query', () => {
    const names = {}, values = {};
    const expr = toExpression<EntityMock>({
      id: '1b2c',
      repoId: '1234',
      version: 'abcd123',
      status: 'active'
    }, propsMock, names, values);

    expect(expr).toEqual('('
      + '#sk = :v1 AND '
      + '#pk = :v2 AND '
      + '#vid = :v3 AND '
      + '#sta = :v4)'
    );
    expect(names).toEqual({
      "#sk": 'sk',
      "#pk": "pk",
      "#sta": "sta",
      "#vid": "vid",
    });
    expect(values).toEqual({
      ":v1": { "S": "DOC#1b2c" },
      ":v2": { "S": "REPO#1234" },
      ":v3": { "S": "abcd123" },
      ":v4": { "S": "active" },
    });
  });

  // ----------------------------------------------------------------

  it('$or object query', () => {
    const names = {}, values = {};
    const expr = toExpression<EntityMock>({
      $or: {
        repoId: '1234',
        version: 'abcd123',
      }
    }, propsMock, names, values);
    
    expect(expr).toEqual('('
      + '#pk = :v1 OR '
      + '#vid = :v2)'
    );
    expect(names).toEqual({
      "#pk": "pk",
      "#vid": "vid",
    });
    expect(values).toEqual({
      ":v1": { "S": "REPO#1234" },
      ":v2": { "S": "abcd123" }
    });
  });

  // ----------------------------------------------------------------

  it('$or array query', () => {
    const names = {}, values = {};
    const expr = toExpression<EntityMock>({
      $or: [
        { repoId: '1234' },
        { version: 'abcd123' }
      ]
    }, propsMock, names, values)
    
    expect(expr).toEqual('('
      + '#pk = :v1 OR '
      + '#vid = :v2)'
    );
    expect(names).toEqual({
      "#pk": "pk",
      "#vid": "vid"
    });
    expect(values).toEqual({
      ":v1": { "S": "REPO#1234" },
      ":v2": { "S": "abcd123" }
    });
  });

  // ----------------------------------------------------------------

  it('all operators', () => {
    const names = {}, values = {};
    const expr = toExpression<EntityMock>({
      $and: [
        { repoId: { $eq: '1' } },
        { repoId: { $ne: '2' } },
        { repoId: { $lt: '3' } },
        { repoId: { $le: '4' } },
        { repoId: { $gt: '5' } },
        { repoId: { $ge: '6' } },
      ]
    }, propsMock, names, values);

    expect(expr).toEqual('('
      + '#pk = :v1 '
      + 'AND #pk <> :v2 '
      + 'AND #pk < :v3 '
      + 'AND #pk <= :v4 '
      + 'AND #pk > :v5 '
      + 'AND #pk >= :v6)'
    );
    expect(names).toEqual({
      "#pk": "pk",
    });
    expect(values).toEqual({
      ":v1": { "S": "REPO#1" },
      ":v2": { "S": "REPO#2" },
      ":v3": { "S": "REPO#3" },
      ":v4": { "S": "REPO#4" },
      ":v5": { "S": "REPO#5" },
      ":v6": { "S": "REPO#6" },
    });
  });

   // ----------------------------------------------------------------

  it('all functions', () => {
    const names = {}, values = {};
    const expr = toExpression<EntityMock>({
      $and: [
        { repoId: { $in: ['1', '2', '3'] } },
        { repoId: { $between: ['4', '5'] } },
        { repoId: { $exists: true } },
        { repoId: { $exists: false } },
        { repoId: { $type: 'string' } },
        { repoId: { $begins: '123' } },
        { repoId: { $contains: '456' } },
        { repoId: { $size: { $gt: '123' } } }
      ]
    }, propsMock, names, values);
    
    expect(expr).toEqual('('
      + '#pk IN (:v1,:v2,:v3) '
      + 'AND (#pk BETWEEN :v4 AND :v5) '
      + 'AND attribute_exists(#pk) '
      + 'AND attribute_not_exists(#pk) '
      + 'AND attribute_type(#pk, :v6) '
      + 'AND begins_with(#pk, :v7) '
      + 'AND contains(#pk, :v8) '
      + 'AND size(pk) > :v9)'
    );
    expect(names).toEqual({
      "#pk": "pk"
    });
    expect(values).toEqual({
      ":v1": { "S": "REPO#1" },
      ":v2": { "S": "REPO#2" },
      ":v3": { "S": "REPO#3" },
      ":v4": { "S": "REPO#4" },
      ":v5": { "S": "REPO#5" },
      ":v6": { "S": "S" },
      ":v7": { "S": "REPO#123" },
      ":v8": { "S": "456" },
      ":v9": { "N": "123" }
    });
   });
  
  // ----------------------------------------------------------------

  it('nested prop operators', () => {
    const names = {}, values = {};
    const expr = toExpression<EntityMock>({
      updatedOn: {
        $gt: 10,
        $lt: 20
      }
    }, propsMock, names, values);
    
    expect(expr).toEqual('('
      + '#uon > :v1 AND '
      + '#uon < :v2)'
    );
    expect(names).toEqual({
      "#uon": "uon"
    });
    expect(values).toEqual({
      ":v1": { "N": 10 },
      ":v2": { "N": 20 },
    });
  });

  // ----------------------------------------------------------------

});