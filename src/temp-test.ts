import "reflect-metadata";
import { DynoModel } from './classes/dyno-model';
import { DynoDriver } from './classes/dyno-driver';
import { DynoEntity } from "./decorators/dyno-entity";
import { DynoProp } from "./decorators/dyno-prop";

@DynoEntity({
  index: [
    { pk: 'DOC#id', sk: 'REP#repoId' },
    { pk: 'REP#repoId', sk: 'VER#version' },
    { pk: 'EM2#createdOn', sk: 'status' },
    { pk: 'USER#', sk: 'createdBy' },
    { pk: 'EM2#createdBy', sk: 'USER#' },
    { pk: 'EM2#repoId' }
  ]
})
export class Entity {

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

const dyno = new DynoDriver({
  tableName: 'test-table',
  endpoint: "http://localhost:8000",
  region: "local",
  metrics: true,
  entities: [Entity]
});

const model: DynoModel<Entity> = dyno.model(Entity);

const result = model.getOne({
  where: {
    $and: {
      id: 2323
    },
    id: '1324242',
    repoId: 'aasdfsaf',
  }
});
