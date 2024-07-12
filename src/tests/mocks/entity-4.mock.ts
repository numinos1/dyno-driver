import { DynoEntity } from '@/decorators/dyno-entity';
import { DynoProp } from '@/decorators/dyno-prop';

@DynoEntity({
  tableName: 'types-table',
  index: [{
    pk: 'ET4#id',
    sk: 'repoId'
  },
  ]
})
export class Entity4Mock {

  @DynoProp({})
  id: string;

  @DynoProp({})
  repoId: number;

  @DynoProp({})
  isBig: boolean;

  @DynoProp({})
  ages: number[];

  @DynoProp({})
  names: string[];

  @DynoProp({})
  list: any[];

  @DynoProp({})
  colors: Set<string>;

  @DynoProp({})
  years: Set<number>;

  @DynoProp({})
  deleteOn?: number;

  @DynoProp({})
  meta: object;

  @DynoProp({})
  meta2: Record<string, number>;

  @DynoProp({})
  body: Buffer;
}

