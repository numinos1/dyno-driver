import { AttributeValue, CreateTableCommandInput } from "@aws-sdk/client-dynamodb";

// --------------------------------------------------
//                    Primitives
// --------------------------------------------------

export type Constructor<T> = new (...args: any[]) => T;

export type TItem = Record<string, AttributeValue>;

export interface TPutOneResult<Type> {
  duration: number,
  wcu: number,
  doc: Type
};

// --------------------------------------------------
//                    Enums
// --------------------------------------------------

export type TRemovalPolicy = 'destroy' | 'retain' | 'snapshot';
export type TBillingMode = 'PAY_PER_REQUEST' | 'PROVISIONED';
export type TProjectionType = 'KEYS_ONLY' | 'INCLUDE' | 'ALL';

// --------------------------------------------------
//                    Entity
// --------------------------------------------------

export interface TEntity {
  entityName?: string;
  tableName?: string;
  index: TEntityIndex[];
  props: Map<string, TProp>,
  aliases: Set<string>
}

export interface TEntityIndex {
  pk: string;
  sk?: string;
  wcu?: number;
  rcu?: number;
  project?: string[];
};

// --------------------------------------------------
//                    Model
// --------------------------------------------------

export type TPropMap = Map<string, TProp>;

export interface TIndex {
  pk: TProp; // Partition Key Property
  sk: TProp; // Sort Key Property
  wcu: number; // Allocated WCU to index
  rcu: number; // Allocated RCU to index
  project: string[]; // Projected Props
};

export interface TProp {
  name: string;           // Model prop name
  alias: string;          // Table prop name
  prefix: string;         // Table prop value prefix
  type: TPropValues;       // Model prop value type
  isRequired: boolean;    // Is the prop required?
  isStatic: boolean;      // IS the prop static?
  isKey: boolean;         // Is the prop a key?
  index: number;          // Index index
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
      type: val,
      isRequired: false,
      isKey: false
    };
    return out
  }, {} as Record<TPropTypes, TProp>);

// --------------------------------------------------
//                Expressions
// --------------------------------------------------

export type TExpression<T> = {
  [P in keyof T]?: T[P] | TComparison<T[P]> | TConjunction<T> | TSize;
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
  $contains?: string | number;
}

export type TSizeComparison = {
  $eq?: number | string;
  $lt?: number | string;
  $le?: number | string;
  $gt?: number | string;
  $ge?: number | string;
  $between?: [number | string, number | string];
}

export type TSize = {
  $size?: TSizeComparison;
};

// --------------------------------------------------
//                Dynamo Stats
// --------------------------------------------------

export interface TDynamoStats {
  table: string; 
  size: number; 
  docs: number; 
  rcu: number; 
  wcu: number; 
};

// --------------------------------------------------
//              Exported Model Schema
// --------------------------------------------------

export interface TModelSchema {
  tableName: string;
  removalPolicy: TRemovalPolicy;
  tableIndex: TIndex[];
}

// --------------------------------------------------
//              Exported Migration Schema
// --------------------------------------------------

export type TMigrationType = 'CREATE' | 'UPDATE' | 'DELETE' | '';

export interface TMigrationSchema {
  tableName: string;
  diffStatus: TMigrationType;
  modelSchema: CreateTableCommandInput,
  dynamoSchema: CreateTableCommandInput
};