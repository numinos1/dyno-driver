# Example Application

doc-entity.ts

```ts 
import { DynoEntity, DynoProp } from 'dyno-driver';

@DynoEntity({
  keys: [
    ['DOC#id', 'REP#repoId'],
    ['REP#repoId', 'VER#version']
  ]
})
export class DocEntity {

  @DynoProp({
    type: 'string'
  })
  id: string;

  @DynoProp({
    type:  'string'
  })
  repoId: string;

  @DynoProp({
    type:  'string'
  })
  version: string;
}
```

dyno.ts

```ts
import { DynoDriver } from 'dyno-driver';
import { DocEntity } from './docs-entity';

// Instantiate the Drive
export const dyno = new DynoDriver({
  tableName: 'test-table',
  endpoint: "http://localhost:8000",
  region: "local",
  metrics: true
})
.on('success', event => console.log('SUCCESS', event))
.on('failure', event => console.log('FAILURE', event));

// Instantiate the docs model
export const docsModel = dyno.entity(DocEntity);
```

docs-service.ts

```ts
import { docsModel } from './dyno';

// Get a document using table scan
const doc = await docsModel.getOne({
  where: {
    repoId: '1234abcd',
  },
  consistent: true,
  order: 'asc',
});

// Get a document by pk + sk
const doc = await docsModel.getOne({
  where: {
    repoId: '1234abcd',
    id: '1234abcd'
  },
  consistent: true,
});

// Get a document by pk + sk query
const doc = await docsModel.getOne({
  where: {
    repoId: '1234abcd',
    id: { $gt: '1234' }
  },
  consistent: true,
  order: 'asc',
});

// QUERY FIRST/LAST DOC WITH FILTER
const doc = await docsModel.getOne({
  where: {
    repoId: '1234abcd',
    id: { $gt: '1234' },
    status: 'active',
    encoding: 'json'
  },
  consistent: true,
  order: 'asc',
});

// GET FIRST/LAST DOC IN TABLE SCAN
const doc = await docsModel.getOne({
  consistent: true,
  order: 'asc',
});

```

# DynamoDb Documentation

- https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html
- https://www.mongodb.com/docs/manual/reference/operator/query/#std-label-query-projection-operators-top

# Typescript Setup

https://www.totaltypescript.com/tsconfig-cheat-sheet
