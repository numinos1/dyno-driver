import { DynoEntity } from '../../src/decorators/dyno-entity';
import { DynoProp } from '../../src/decorators/dyno-prop';

@DynoEntity({
  index: [
    { pk: 'ABC#id', sk: 'REP#repoId' },
    { pk: 'ABC#repoId', sk: 'VER#version' },
    { pk: 'ABC#createdOn', sk: 'ABC#status' }
  ]
})
export class Entity3Mock {

  @DynoProp({
    type: 'string',
    alias: 'doc'
  })
  id: string;

  @DynoProp({
    type: 'string',
    alias: 'rep'
  })
  repoId: string;

  @DynoProp({
    type: 'string',
    alias: 'ver'
  })
  version: string;

  @DynoProp({
    type:  'string',
    alias: 'enc'
  })
  encoding: string;

  @DynoProp({
    type:  'string',
    alias: 'sta'
  }) 
  status: string;

  @DynoProp({
    type:  'string',
    alias: 'cby'
  })
  createdBy: string;

  @DynoProp({
    type:  'number',
    alias: 'con'
  })
  createdOn: number;

  @DynoProp({
    type:  'string',
    alias: 'uby'
  })
  updatedBy: string;

  @DynoProp({
    type:  'number',
    alias: 'uon'
  })
  updatedOn: number;

  @DynoProp({
    type:  'number',
    alias: 'ttl'
  })
  deleteOn?: number;

  @DynoProp({
    type:  'binary',
    alias: 'bod'
  })
  body: string;
}
