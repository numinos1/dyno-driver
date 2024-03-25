import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { container } from 'tsyringe';
import { DynoModel } from '@/classes/dyno-model';
import { prune } from '@/utils';
import { entitiesMap } from '@/utils';
import { TBillingMode, TEventType, TRemovalPolicy, TSubscription } from '@/types';

const VALID_TABLE_NAME = /^[a-zA-Z0-9_.-]{3,255}$/;
const VALID_ATTR_NAME = /^[a-zA-Z0-9_.-]{2,255}$/;

/**
 * DynoDrive Class
 */
export class DynoDrive {
  private tableName: string;  
  private endpoint?: string;
  private region?: string;
  private metrics: boolean;
  private client: DynamoDBDocumentClient;
  private models: DynoModel<any>[];
  private subscriptions: TSubscription[];
  private removalPolicy?: TRemovalPolicy;
  private billingMode?: TBillingMode;

  /**
   * Constructor
   */
  constructor({
    tableName,
    endpoint,
    region,
    entities,
    metrics = false,
    removalPolicy = 'destroy',
    billingMode = 'PAY_PER_REQUEST'
  }: {
    tableName: string;
    endpoint?: string;
    region?: string;
    removalPolicy?: TRemovalPolicy,
    billingMode?: TBillingMode,
    entities?: Function[];
    metrics?: boolean;    
  }) {
    if (!VALID_TABLE_NAME.test(tableName)) {
      throw new Error(`invalid tableName: "${tableName}"`);
    }
    this.tableName = tableName;
    this.endpoint = endpoint;
    this.region = region;
    this.metrics = metrics;
    this.removalPolicy = removalPolicy;
    this.billingMode = billingMode;
    this.client = this.toClient();
    this.subscriptions = [];
    this.models = [];

    if (entities) {
      entities.forEach(entity => this.entity(entity));
    }
  }

  // ----------------------------------------------------------------
  //    Public Boostrap Methods
  // ----------------------------------------------------------------

  /**
   * Add an entity
   */
  entity(entity: Function) {
    const entry = entitiesMap.get(entity.prototype);
    
    // Validate entity
    if (!entry) {
      throw new Error(`not an Entity: ${entity}`);
    }
    let { entityName, tableName, keys, props } = entry;

    // Validate entity name
    if (!entityName) {
      throw new Error(`Missing entity name: ${entity}`);
    }
    if (!VALID_ATTR_NAME.test(entityName)) {
      throw new Error(`Invalid entity name: ${entityName}`);
    }

    // Validate table name
    if (!tableName) {
      tableName = this.tableName;
    }
    else if (!VALID_TABLE_NAME.test(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }

    // Instantiate the model
    const model = new DynoModel<typeof entity>({
      client: this.client,
      metrics: this.metrics,
      subscriptions: this.subscriptions,
      removalPolicy: this.removalPolicy,
      billingMode: this.billingMode,
      entityName: entityName,
      tableName: tableName,
      keys: keys,
      props: props,
    });

    // Add model to the models
    this.models.push(model);

    // Add model to the DI registry
    container.register(entity as any, {
      useValue: model
    });

    return model;
  }

  /**
   * Subscriptions
   */
  on(type: TEventType, cb: Function) {
    this.subscriptions.push({ type, cb });
  }

  // ----------------------------------------------------------------
  //    Private Methods
  // ----------------------------------------------------------------

  /**
   * To Document Client
   */
  private toClient(): DynamoDBDocumentClient {
    return DynamoDBDocumentClient.from(
      new DynamoDBClient(
        prune({
          endpoint: this.endpoint,
          region: this.region 
        })
      ),
      {
        marshallOptions: {
          convertEmptyValues: false, // if not false explicitly, we set it to true.
          removeUndefinedValues: false, // false, by default.
          convertClassInstanceToMap: false, // false, by default.
        },
        unmarshallOptions: {
          wrapNumbers: false, // false, by default.
        }
      }
    );
  }

  // ----------------------------------------------------------------
  //    Public Migration Methods
  // ----------------------------------------------------------------

  /**
   * Get DynamoDb Table Definitions
   */
  toTables() {
    return this.models.reduce((tables, model) => {
      if (!tables.includes(model.tableName)) {
        tables.push({
          table: model.toTable(),
          indices: model.toIndices()
        });
      }
      return tables;
    }, []);
  }
}
