import {
  DynamoDBClient,
  DeleteTableCommand,
  DeleteTableCommandInput,
  DescribeTableCommand,
  ListTablesCommand,
  CreateTableCommand,
  CreateTableCommandInput,
  TableDescription
} from "@aws-sdk/client-dynamodb"; 
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { container } from 'tsyringe';
import { DynoModel } from '@/classes/dyno-model';
import { prune } from '@/utils';
import { entitiesMap } from '@/utils';
import { TBillingMode, TEventType, TRemovalPolicy, TSubscription } from '@/types';

const VALID_TABLE_NAME = /^[a-zA-Z0-9_.-]{3,255}$/;
const VALID_ATTR_NAME = /^[a-zA-Z0-9_.-]{2,255}$/;

/**
 * DynoDriver Class
 */
export class DynoDriver {
  public tableName: string;  
  public endpoint?: string;
  public region?: string;
  public metrics: boolean;
  public client: DynamoDBClient;
  public models: DynoModel<any>[];
  public subscriptions: TSubscription[];
  public removalPolicy?: TRemovalPolicy;
  public billingMode?: TBillingMode;

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
    this.client = new DynamoDBClient(prune({ endpoint, region }));
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
   * Middleware Events
   */
  on(type: TEventType, cb: Function) {
    this.subscriptions.push({ type, cb });
  }

  /**
   * To Document Client
   */
  // private toClient(): DynamoDBDocumentClient {
  //   return DynamoDBDocumentClient.from(
  //     new DynamoDBClient(
  //       prune({
  //         endpoint: this.endpoint,
  //         region: this.region 
  //       })
  //     ),
  //     {
  //       marshallOptions: {
  //         convertEmptyValues: false, // if not false explicitly, we set it to true.
  //         removeUndefinedValues: false, // false, by default.
  //         convertClassInstanceToMap: false, // false, by default.
  //       },
  //       unmarshallOptions: {
  //         wrapNumbers: false, // false, by default.
  //       }
  //     }
  //   );
  // }

  // ----------------------------------------------------------------
  //    Public Migration Methods
  // ----------------------------------------------------------------

  /**
   * Get CDK Table Definitions from models
   */
  toCdkTables() {
    return this.models.reduce((tables, model) => {
      if (!tables.includes(model.tableName)) {
        tables.push({
          table: model.toCdkTable(),
          indices: model.toCdkIndices()
        });
      }
      return tables;
    }, []);
  }

  /**
   * Extract Stats from Dynamo Db Schemas
   */
  toDdbStats(tables: TableDescription[]) {
    return tables.reduce((out, table) => {
      out.push({
        table: table.TableName,
        size: table.TableSizeBytes,
        docs: table.ItemCount,
        rcu: table.ProvisionedThroughput.ReadCapacityUnits,
        wcu: table.ProvisionedThroughput.WriteCapacityUnits
      });
      table.GlobalSecondaryIndexes.forEach(index => {
        out.push({
          table: table.TableName,
          index: index.IndexName,
          size: index.IndexSizeBytes,
          docs: index.ItemCount,
          rcu: index.ProvisionedThroughput.ReadCapacityUnits,
          wcu: index.ProvisionedThroughput.WriteCapacityUnits
        });
      });
      return out;
    }, []);
  }

  /**
   * Get Dynamo Db Table Props
   **/
  async getDdbTables(): Promise<Record<string, TableDescription>> {
    const names = await this.getDdbTableNames();
    const tables = {};

    for (let i = 0; i < names.length; i++) {
      const TableName = names[i];
      tables[TableName] = await this.getDdbTableProps(TableName);
    }
    return tables;
  }

  /**
   * Get Dynamo Db Table Names
   */
  async getDdbTableNames(): Promise<string[]> {
    const result = await this.client.send(
      new ListTablesCommand({ Limit: 100 })
    );
    return result.TableNames || [];
  }

  /**
   * Get Dynamo Db Table Props
   */
  async getDdbTableProps(TableName: string): Promise<TableDescription> {
    const config = await this.client.send(
      new DescribeTableCommand({ TableName })
    );
    return config.Table;
  }
}
