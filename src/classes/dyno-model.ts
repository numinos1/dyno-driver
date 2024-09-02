import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb"; // ES Modules import
import { singleton } from 'tsyringe';
import { TBillingMode, TEntityIndex, TExpression, TIndex, TItem, TModelSchema, TOrder, TProp, TPropMap, TRemovalPolicy } from '@/types';
import { TQueryType, toStrategy } from '@/helpers/to-strategy';
import { BatchWrite } from '@/helpers/queries/batch-write';
import { toDoc } from '@/helpers/marshall/to-doc';
import { toItem } from '@/helpers/marshall/to-item';
import { toIndex } from '@/helpers/to-index';
import { Timer } from "@/utils";
import { scanTable } from "@/helpers/queries/scan-table";
import { queryTable } from "@/helpers/queries/query-table";
import { getItem } from "@/helpers/queries/get-item";
import { putItem } from "@/helpers/queries/put-item";
import { deleteItem } from "@/helpers/queries/delete-item";
import { toDocKeys } from "@/helpers/marshall/to-doc-keys";
import { toItemKeys } from "@/helpers/marshall/to-item-keys";
import { BatchGet } from "@/helpers/queries/batch-get";

export interface GetBatchOptions<T> {
  keys: Partial<T>[],
  consistent?: boolean;
  batchSize?: number,
  concurrency?: number,
  maxBackoff?: number,
  retryBackoff?: number
}

export interface GetOneOptions<T> {
  where: TExpression<T>,
  consistent?: boolean;
  order?: TOrder;
}

export interface GetManyOptions<T> {
  where?: TExpression<T>,
  consistent?: boolean;
  order?: TOrder;
  limit?: number;
  start?: Partial<T>;
}

/**
 * Dyno Model
 */
@singleton()
export class DynoModel<Type> {
  public client: DynamoDBClient;
  public tableName: string;
  public tableIndex: TIndex[]; // 
  public propMap: TPropMap; // used to map documents to dynamo items
  public propStack: TProp[]; // used to map dynamo items to documents
  public propCount: number; // end of the public section of the propMap
  public metrics: boolean;
  public removalPolicy: TRemovalPolicy;
  public billingMode: TBillingMode;
  public entity: Function;

  // -------------------------------------------------------------------

  /**
   * Constructor
   */
  constructor({
    entityName,
    tableName,
    entity,
    index,
    props,
    client,
    removalPolicy,
    metrics,
  }: {
    entityName: string;
    tableName: string;
    entity: Function;
    index: TEntityIndex[]; // array of index definitions from entity decorator
    props: TPropMap; // map of property definitions from prop decorators
    client: DynamoDBClient;
    removalPolicy: TRemovalPolicy;
    metrics: boolean;
  }) {
    try {
      this.client = client;
      this.tableName = tableName;
      this.metrics = metrics;
      this.entity = entity;
      this.removalPolicy = removalPolicy;
      this.propMap = props;
      this.propStack = [...props.values()]; // add all props defined in the entity
      this.propCount = props.size; // record end of entity defined props
      this.tableIndex = toIndex(
        index,
        this.propStack,
        this.propMap,
        tableName
      );
    }
    catch (err) {
      err.message = `Entity "${entityName}" ${err.message}`;
      throw err;
    }
  }

  // -------------------------------------------------------------------
  //      Put One
  // -------------------------------------------------------------------

  async putOne(
    doc: Type,
    where?: TExpression<Type>
  ) {
    const timer = this.metrics && Timer();
    const command = putItem<Type>(
      doc,
      where,
      this.metrics,
      this.tableName,
      this.propMap,
      this.propStack
    );
    const result = await this.client.send(command);

    return {
      duration: timer(),
      cost: result.ConsumedCapacity?.CapacityUnits || 0,
      doc: doc,
      command: command.input
    };
  }

  // -------------------------------------------------------------------
  //      Put Many
  // -------------------------------------------------------------------

  /**
   * - TODO: If where, call putOne() for each entry
   * - TODO: Else, call batchPut() for each batch
   */
  async putMany(
    docs: Type[]
  ) {
    const timer = this.metrics && Timer();

    const results = await BatchWrite<Type>({
      client: this.client,
      tableName: this.tableName,
      writeRequests: docs.map(doc => ({
        PutRequest: {
          Item: toItem<Type>(doc, this.propStack)
        }
      }))
    });

    return {
      duration: timer(),
      cost: results.batches.reduce((wcu, batch) =>
        wcu + batch.wcu,
        0
      ),
      docs,
      saved: results.saved.map(keys =>
        toDocKeys(keys, this.tableIndex[0])
      ),
      failed: results.failed.map(keys =>
        toDocKeys(keys, this.tableIndex[0])
      ),
      errors: results.errors,
      retries: results.retries,
      batches: results.batches
    };
  }

  // -------------------------------------------------------------------
  //        Get One
  // -------------------------------------------------------------------

  /**
   * Get One Document
   * Note - Table Scan does not support "order"
   */
  async getOne(
    options: GetOneOptions<Type>
  ) {
    const strategy = toStrategy(options.where, this.tableIndex, this.tableName);
    const getOptions: GetManyOptions<Type> = { ...options, limit: 1 };
    const timer = Timer();

    switch (strategy.type) {
      case TQueryType.tableScan: {
        const command = scanTable<Type>(
          getOptions,
          strategy,
          this.metrics,
          this.propMap
        );
        const result = await this.client.send(command);

        return {
          duration: timer(),
          cost: result.ConsumedCapacity.CapacityUnits || 0,
          doc: this.unmarshall(result.Items?.[0]),
          strategy: TQueryType[strategy.type],
          table: strategy.table,
          index: strategy.index,
          command: command.input
        };
      }
      case TQueryType.pkQuery:
      case TQueryType.skQuery: {
        const command = queryTable<Type>(
          getOptions,
          strategy,
          this.metrics,
          this.propMap
        );
        const result = await this.client.send(command);

        return {
          duration: timer(),
          cost: result.ConsumedCapacity.CapacityUnits || 0,
          doc: this.unmarshall(result.Items?.[0]),
          strategy: TQueryType[strategy.type],
          table: strategy.table,
          index: strategy.index,
          command: command.input
        };
      }
      case TQueryType.getItem: {
        const command = getItem<Type>(
          options,
          strategy,
          this.metrics,
          this.propMap
        );
        const result = await this.client.send(command);

        return {
          duration: timer(),
          cost: result.ConsumedCapacity.CapacityUnits || 0,
          doc: this.unmarshall(result.Item),
          strategy: TQueryType[strategy.type],
          table: strategy.table,
          index: strategy.index,
          command: command.input
        };
      }
    }
  }

  // -------------------------------------------------------------------
  //      Get Many
  // -------------------------------------------------------------------

  /**
   * Get Many Documents
   * Note - Table Scan does not support "order"
   */
  async getMany(
    options: GetManyOptions<Type>
  ) {
    const strategy = toStrategy(
      options.where,
      this.tableIndex,
      this.tableName
    );
    const timer = Timer();
    const getOptions: GetManyOptions<Type> = { limit: 250, ...options };

    switch (strategy.type) {
      case TQueryType.tableScan: {
        const command = scanTable<Type>(
          options,
          strategy,
          this.metrics,
          this.propMap
        );
        const result = await this.client.send(command);

        return {
          duration: timer(),
          cost: result.ConsumedCapacity.CapacityUnits || 0,
          docs: result.Items.map(item => this.unmarshall(item)),
          next: this.unmarshall(result.LastEvaluatedKey),
          strategy: TQueryType[strategy.type],
          table: strategy.table,
          index: strategy.index,
          command: command.input
        };
      }
      case TQueryType.pkQuery:
      case TQueryType.skQuery:
      case TQueryType.getItem: {
        const command = queryTable<Type>(
          options,
          strategy,
          this.metrics,
          this.propMap
        );
        const result = await this.client.send(command);

        return {
          duration: timer(),
          cost: result.ConsumedCapacity.CapacityUnits || 0,
          docs: result.Items.map(item => this.unmarshall(item)),
          next: this.unmarshall(result.LastEvaluatedKey),
          strategy: TQueryType[strategy.type],
          table: strategy.table,
          index: strategy.index,
          command: command.input
        };
      }
    }
  }

  // -------------------------------------------------------------------
  //      Get Batch
  // -------------------------------------------------------------------

  async getBatch(
    options: GetBatchOptions<Type>
  ) {
    const timer = this.metrics && Timer();

    const results = await BatchGet<Type>({
      client: this.client,
      docKeys: options.keys,
      tableIndex: this.tableIndex,
      consistent: options.consistent === true,
      batchSize: options.batchSize || 100,
      concurrency: options.concurrency || 3,
      maxBackoff: options.maxBackoff || (60 * 1000),
      retryBackoff: options.retryBackoff || 50
    });
    return {
      duration: timer(),
      cost: results.batches.reduce((rcu, batch) =>
        rcu + batch.rcu,
        0
      ),
      docs: results.results.map(item => 
        toDoc<Type>(item, this.propStack, this.propCount)
      ),
      errors: results.errors,
      retries: results.retries,
      batches: results.batches
    };
  }

  // -------------------------------------------------------------------
  //      Delete
  // -------------------------------------------------------------------

  async deleteOne(
    where: TExpression<Type>
  ) {
    const strategy = toStrategy(where, this.tableIndex, this.tableName);
    const timer = Timer();

    if (strategy.index) {
      throw new Error(`Invalid delete key`);
    }
    switch (strategy.type) {
      case TQueryType.pkQuery:
      case TQueryType.skQuery:
      case TQueryType.getItem: {
        const command = deleteItem<Type>(
          strategy,
          this.metrics,
          this.propMap
        );
        const result = await this.client.send(command);

        return {
          duration: timer(),
          cost: result.ConsumedCapacity.CapacityUnits || 0,
          doc: this.unmarshall(result.Attributes),
          command: command.input
        };
      }
      default:
        throw new Error(`Invalid delete expression`);
    }
  }

  // -------------------------------------------------------------------
  //      Delete Many
  // -------------------------------------------------------------------

  async deleteMany(
    docs: Partial<Type>[]
  ) {
    const timer = this.metrics && Timer();

    const results = await BatchWrite<Type>({
      client: this.client,
      tableName: this.tableName,
      writeRequests: docs.map(doc => ({
        DeleteRequest: {
          Key: toItemKeys<Type>(doc, this.tableIndex[0])
        }
      }))
    });

    return {
      duration: timer(),
      cost: results.batches.reduce((wcu, batch) =>
        wcu + batch.wcu,
        0
      ),
      docs,
      deleted: results.saved.map(keys =>
        toDocKeys(keys, this.tableIndex[0])
      ),
      failed: results.failed.map(keys =>
        toDocKeys(keys, this.tableIndex[0])
      ),
      errors: results.errors,
      retries: results.retries,
      batches: results.batches
    };
  }

  // ----------------------------------------------------------------
  //    
  // ----------------------------------------------------------------

  /**
   * Export the model schema 
   * 
   * - Used to check for single-table collisions
   */
  toModelSchema(): TModelSchema {
    return {
      tableName: this.tableName,
      removalPolicy: this.removalPolicy,
      tableIndex: this.tableIndex
    };
  }


  /**
   * Unmarshall Document
   */
  unmarshall(doc: TItem | undefined): Type | undefined {
    return doc
      ? toDoc<Type>(doc, this.propStack, this.propCount)
      : undefined;
  }
}
