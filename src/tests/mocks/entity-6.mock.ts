import { DynoEntity } from '@/decorators/dyno-entity';
import { DynoProp } from '@/decorators/dyno-prop';

@DynoEntity({
  index: [
    { pk: 'USER#', sk: 'id' },
    { pk: 'USER#', sk: 'emailHash' }
  ]
})
export class Entity6Mock {

  @DynoProp({ alias: 'id' })
  id: string;

  @DynoProp({ alias: 'hsh' })
  emailHash: string;

  @DynoProp({
    alias: 'slg'
  })
  slug: string;

  @DynoProp({
    alias: 'fst'
  })
  first: string;

  @DynoProp({
    alias: 'lst'
  })
  last: string;

  @DynoProp({
    alias: 'eml'
  })
  email: string;

  @DynoProp({
    alias: 'pas'
  })
  password: string;

  @DynoProp({
    alias: 'img'
  })
  image: string;

  @DynoProp({
    alias: 'rol'
  })
  role: UserRole;

  @DynoProp({
    alias: 'sta'
  })
  status: UserStatus;

  @DynoProp({
    alias: 'con'
  })
  createdOn: number;

  @DynoProp({
    alias: 'uon'
  })
  updatedOn: number;
}

/**
 * UserRole
 */
export enum UserRole {
  member = 'member',
  super = 'super'
}

/**
 * UserStatus 
 */
export enum UserStatus {
  prospective = 'prospective',
  registered = 'registered',
  verified = 'verified',
  suspended = 'suspended',
  deleted = 'deleted'
}

