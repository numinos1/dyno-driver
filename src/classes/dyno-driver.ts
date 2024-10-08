import {
  DynamoDBClient,
  DeleteTableCommand,
  DescribeTableCommand,
  ListTablesCommand,
  CreateTableCommand,
  CreateTableCommandInput,
  TableDescription
} from "@aws-sdk/client-dynamodb"; 
import { container } from 'tsyringe';
import { DynoModel } from '@/classes/dyno-model';
import { entitiesMap, pruneObject } from '@/utils';
import { TBillingMode, TMigrationSchema, TRemovalPolicy, Constructor } from '@/types';
import { mergeSchemas } from "@/helpers/schemas/merge-schemas";
import { exportCdkSchemas } from "@/helpers/schemas/export-cdk-schemas";
import { exportDynamoSchemas } from '@/helpers/schemas/export-dynamo-schemas';
import { normalizeDynamoSchema } from "@/helpers/schemas/normalize-dynamo-schema";
import { compareSchemas } from "@/helpers/schemas/compare-schemas";

const VALID_TABLE_NAME = /^[a-zA-Z0-9_.-]{3,255}$/;
const VALID_ATTR_NAME = /^[a-zA-Z0-9_.-]{2,255}$/;

/**
 * Dummy Logger
 */
class Logger {
  constructor() { }
  log(data: any) {}
}

/**
 * DynoDriver Class
 */
export class DynoDriver {
  public tableName: string;  
  public endpoint?: string;
  public region?: string;
  public metrics: boolean;
  public client: DynamoDBClient;
  public models: Map<Function, DynoModel<any>>;
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
  }: {
    tableName: string;
    endpoint?: string;
    region?: string;
    removalPolicy?: TRemovalPolicy,
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
    this.client = new DynamoDBClient(pruneObject({ endpoint, region }));
    this.models = new Map();

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
    let { entityName, tableName, index, props } = entry;

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
      removalPolicy: this.removalPolicy,
      entityName: entityName,
      tableName: tableName,
      entity: entity,
      index: index,
      props: props,
    });

    // Add model to the models
    this.models.set(entity, model);

    // Add model to the DI registry
    container.register(entity as any, {
      useValue: model
    });

    return model;
  }

  /**
   * Get instantiated model from a constructor
   */
  model<T>(entity: Constructor<T>): DynoModel<T> {
    return this.models.get(entity);
  }

  // ----------------------------------------------------------------
  //    High-Level Migration Methods
  // ----------------------------------------------------------------
  
  /**
   * Re-Create All Tables
   */
  async resetTables(): Promise<Record<string, TMigrationSchema[]>> {
    const deleted = await this.deleteTables();
    const created = await this.createTables();

    return {
      ...deleted,
      ...created
    };
  }

  /**
   * Delete Existing Tables
   */
  async deleteTables(): Promise<Record<string, TMigrationSchema[]>> {
    const schemas = await this.exportMigrationSchemas();
    const actionable = schemas.filter(schema => schema.diffStatus !== 'CREATE');
    
    if (actionable.length) {
      await this.deleteDynamoTables(
        actionable.map(schema => schema.tableName)
      );
    }
    return { deleted: actionable };
  }

  /**
   * Create Non-Existing Tables
   */
  async createTables(allTables = false): Promise<Record<string, TMigrationSchema[]>> {
    const schemas = await this.exportMigrationSchemas(allTables);
    const actionable = schemas.filter(schema => schema.diffStatus === 'CREATE');
    
    if (actionable.length) {
      //console.log(JSON.stringify(actionable, null, '  '));
      await this.createDynamoTables(
        actionable.map(schema => schema.modelSchema)
      );
    }
    return { created: actionable };
  }

  // ----------------------------------------------------------------
  //    Export Model Details
  // ----------------------------------------------------------------

  /**
   * Export as JSON object
   */
  toJSON() {
    return {
      tableName: this.tableName,
      endpoint: this.endpoint,
      region: this.region,
      metrics: this.metrics,
      removalPolicy: this.removalPolicy,
      models: [...this.models.entries()].map(([name, model]) => ({
        name: name,
        model: model.toJSON()
      }))
    };
  }

  // ----------------------------------------------------------------
  //    Export Migration Schemas
  // ----------------------------------------------------------------

  /**
   * Export Migration Schemas
   */
  async exportMigrationSchemas(allTables = false): Promise<TMigrationSchema[]> {
    const modelSchemas = this.exportDynamoSchemas();
    const dynamoSchemas = await this.getDynamoTableSchemas();
    const dynamoCore = Object.values(dynamoSchemas).map(normalizeDynamoSchema);
    const modelCore = modelSchemas.map(normalizeDynamoSchema);

    return compareSchemas(modelCore, dynamoCore).filter(entry => allTables
      || modelSchemas.find(schema => schema.TableName === entry.tableName)
    );
  }

  /**
   * Export Model Schemas
   */
  exportModelSchemas() {
    return mergeSchemas(
      [...this.models.values()].map(model =>
        model.toModelSchema()
      )
    );
  }

  /**
   * Export CDK Schemas
   */
  exportCdkSchemas() {
    return exportCdkSchemas(
      this.exportModelSchemas()
    );
  }

  /**
   * Export Dynamo Schemas
   */
  exportDynamoSchemas(): CreateTableCommandInput[] {
    return exportDynamoSchemas(
      this.exportModelSchemas()
    );
  }

  // ----------------------------------------------------------------
  //    Low-Level DynamoDB Migration Methods
  // ----------------------------------------------------------------

  /**
   * Get Dynamo Db Table Props
   **/
  async getDynamoTableSchemas(): Promise<Record<string, TableDescription>> {
    const names = await this.getDynamoTableNames();
    const tables = {};

    for (let i = 0; i < names.length; i++) {
      const TableName = names[i];
      tables[TableName] = await this.getDynamoTableSchema(TableName);
    }
    return tables;
  }

  /**
   * Get Dynamo Db Table Schema
   */
  async getDynamoTableSchema(TableName: string): Promise<TableDescription> {
    const config = await this.client.send(
      new DescribeTableCommand({ TableName })
    );
    return config.Table;
  }

  /**
   * Get Dynamo Db Table Names
   */
  async getDynamoTableNames(): Promise<string[]> {
    const result = await this.client.send(
      new ListTablesCommand({ Limit: 100 })
    );
    return result.TableNames || [];
  }

  /**
   * Delete Dynamo Db Tables by Name
   */
  async deleteDynamoTables(TableNames: string[]) {
    const results = [];

    for (let TableName of TableNames) {
      const result = await this.client.send(
        new DeleteTableCommand({ TableName })
      );
      if (result.TableDescription) {
        results.push(result.TableDescription);
      }
    }
    return results;
  }

  /**
   * Create Dynamo Db Tables
   */
  async createDynamoTables(schemas: CreateTableCommandInput[]) {
    const results = [];

    for (let schema of schemas) {
      const result = await this.client.send(
        new CreateTableCommand(schema)
      );
      if (result.TableDescription) {
        results.push(result.TableDescription);
      }
    }
    return results;
  }
 
}
