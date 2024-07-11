import { DynoEntity } from '@/decorators/dyno-entity';
import { DynoProp } from '@/decorators/dyno-prop';

@DynoEntity({
  index: [
    { pk: 'DOC1#id', sk: 'REP#repoId' },
    { pk: 'REP1#repoId', sk: 'VER#version' }
  ]
})
export class EntityMock {

  @DynoProp({
    alias: 'doc'
  })
  id: string;

  @DynoProp({
    alias: 'rep'
  })
  repoId: string;

  @DynoProp({
    alias: 'ver'
  })
  version: string;

  @DynoProp({
    alias: 'enc'
  })
  encoding: string;

  @DynoProp({
    alias: 'sta'
  }) 
  status: string;

  @DynoProp({
    alias: 'cby'
  })
  createdBy: string;

  @DynoProp({
    alias: 'con'
  })
  createdOn: number;

  @DynoProp({
    alias: 'uby'
  })
  updatedBy: string;

  @DynoProp({
    alias: 'uon'
  })
  updatedOn: number;

  @DynoProp({
    alias: 'ttl'
  })
  deleteOn?: number;

  @DynoProp({
    alias: 'bod'
  })
  body: Buffer;
}

