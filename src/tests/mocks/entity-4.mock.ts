import { DynoEntity } from '@/decorators/dyno-entity';
import { DynoProp } from '@/decorators/dyno-prop';

@DynoEntity({
  tableName: 'types-table',
  index: [{
    pk: 'repo#repoId',
    sk: 'doc#docId'
  },
  ]
})
export class Entity4Mock {

  @DynoProp({})
  repoId: string;

  @DynoProp({})
  docId: string;

  @DynoProp({})
  isBig: boolean;

  @DynoProp({})
  alias: string;

  @DynoProp({})
  total: number;

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

