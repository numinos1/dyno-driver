export type TRemovalPolicy = 'destroy' | 'retain' | 'snapshot';
export type TBillingMode = 'PAY_PER_REQUEST' | 'PROVISIONED';
export type TProjectionType = 'KEYS_ONLY' | 'INCLUDE' | 'ALL';

// --------------------------------------------------
//                    Entity
// --------------------------------------------------

export interface TEntity {
  entityName?: string;
  tableName?: string;
  keys: TKeys[];
  props: Map<string, TProp>
}

// --------------------------------------------------
//                    Events
// --------------------------------------------------

export interface TSubscription {
  type: TEventType;
  cb: Function;
}

export type TEventType = 'success' | 'failure';

// --------------------------------------------------
//                    Model
// --------------------------------------------------

export type TKeys = [string, string?];

export type TPropMap = Map<string, TProp>;

export interface TProp {
  name: string;
  alias: string;
  prefix: string;
  type: TPropTypes;
  token: TPropTokens;
  isRequired: boolean;
  isKey: boolean;
  index: number;
}

export type TOrder = 'asc' | 'desc';

// --------------------------------------------------
//                    Entity
// --------------------------------------------------

export enum TPropTokens {
  number = 'N',
  string = 'S',
  binary = 'B',
  boolean = 'BOOL',
  null = 'NULL',
  list = 'L',
  map = 'M',
  stringSet = 'SS', // new Set<string>();
  numberSet = 'NS', // new Set<number>();
  binarySet = 'BS', // new Set<buffer>();
}

export type TPropTypes = keyof typeof TPropTokens;

export type TPropValues = typeof TPropTokens[TPropTypes];

// used by $type function
export const PropTypes = Object
  .entries(TPropTokens)
  .reduce((out, [key, val]) => {
    out[key] = {
      name: key,
      alias: val,
      prefix: '',
      type: key as TPropTypes,
      token: val,
      isRequired: false,
      isKey: false
    };
    return out
  }, {} as Record<TPropTypes, TProp>);

// --------------------------------------------------
//                Expressions
// --------------------------------------------------

export type TExpression<T> = {
  [P in keyof T]?: T[P] | TComparison<T[P]> | TConjunction<T> | TSize<T[P]>;
} & TConjunction<T>;

export type TConjunction<T> = {
  $and?: TExpression<T> | TExpression<T>[];
  $or?: TExpression<T> | TExpression<T>[];
};

export type TComparison<P> = {
  $eq?: P;
  $ne?: P;
  $lt?: P;
  $le?: P;
  $gt?: P;
  $ge?: P;
  $in?: P[];
  $between?: [P, P];
  $exists?: boolean;
  $type?: TPropTypes;
  $begins?: string;
  $contains?: string;
}

export type TSize<P> = {
  $size?: TComparison<P>;
};
