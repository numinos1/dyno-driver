import { AttributeValue, ConsumedCapacity, DynamoDBClient, GetItemCommand, QueryCommandOutput } from "@aws-sdk/client-dynamodb"; // ES Modules import
import { singleton } from 'tsyringe';
import { TBillingMode, TEntityIndex, TExpression, TIndex, TModelSchema, TOrder, TProp, TPropMap, TRemovalPolicy } from '@/types';
import { TStrategy, TQueryType, toStrategy } from '@/helpers/to-strategy';
import { BatchWrite, TBatchResults } from '@/helpers/queries/batch-write';
import { toKeys } from '@/helpers/marshall/to-keys';
import { toDoc } from '@/helpers/marshall/to-doc';
import { toItem } from '@/helpers/marshall/to-item';
import { toIndex } from '@/helpers/to-index';
import { Timer } from "@/utils";
import { scanTable } from "@/helpers/queries/scan-table";
import { queryTable } from "@/helpers/queries/query-table";
import { getItem } from "@/helpers/queries/get-item";
import { putItem } from "@/helpers/queries/put-item";

export interface GetOptions<T> {
  where: TExpression<T>,
  consistent?: boolean;
  order?: TOrder;
}

/**
 * Dyno Model
 */
@singleton()
export class DynoModel<Type> {
  public client: DynamoDBClient;
  public tableName: string;
  public tableIndex: TIndex[];
  public propMap: TPropMap;
  public propStack: TProp[];
  public propCount: number;
  public metrics: boolean;
  public removalPolicy: TRemovalPolicy;
  public billingMode: TBillingMode;
  public entity: Function;
  public logger: Function;

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
    logger
  }: {
    entityName: string; 
    tableName: string; 
    entity: Function;
    index: TEntityIndex[];
    props: TPropMap;
    client: DynamoDBClient;
    removalPolicy: TRemovalPolicy;
    metrics: boolean;
    logger: Function;
  }) {
    try {
      this.client = client;
      this.tableName = tableName;
      this.metrics = metrics;
      this.entity = entity;
      this.removalPolicy = removalPolicy;
      this.propMap = props;
      this.propStack = [...props.values()];
      this.propCount = props.size;
      this.tableIndex = toIndex(index, this.propStack);
      this.logger = logger || function logger() { };
    }
    catch (err) {
      err.message = `Entity "${entityName}" ${err.message}`;
      throw err;
    }
  }

  // -------------------------------------------------------------------

  /**
   * Put One
   */
  async putOne(
    doc: Type,
    where?: TExpression<Type>
  ): Promise<Type> { 
    const timer = this.metrics && Timer();

    try {
      const result = await this.client.send(
        putItem<Type>(
          doc,
          where,
          this.metrics,
          this.tableName,
          this.propMap,
          this.propStack
        )
      );

      this.logger({
        message: 'putOne success',
        duration: timer(),
        wcu: result.ConsumedCapacity?.CapacityUnits || 0,
      });

      return doc;
    }
    catch (error) {
      this.logger({
        message: 'putOne failure',
        duration: timer(),
        error
      });
      throw error;
    }
  }

  // -------------------------------------------------------------------

  /**
   * Put Many
   * 
   * - TODO: If where, call putOne() for each entry
   * - TODO: Else, call batchPut() for each batch
   */
  async putMany(
    docs: Type[]
  ): Promise<TBatchResults> {
    const timer = this.metrics && Timer();

    try {
      const results = await BatchWrite<Type>({
        client: this.client,
        tableName: this.tableName,
        writeRequests: docs.map(doc => ({
          PutRequest: {
            Item: toItem<Type>(doc, this.propStack)
          }
        }))
      });

      this.logger({
        message: 'putMany success',
        duration: timer(),
        wcu: results.batches.reduce(
          (wcu, batch) => wcu + batch.wcu,
          0
        )
      });

      // TODO - Return processed results
      // TODO - ids need to be correlated to input docs
      // TODO - Return an array of status' in the order of the inputs
      return results;
    }
    catch (error) {
      this.logger({
        message: 'putMany failure',
        duration: timer(),
        error
      });
      throw error;
    }
  }

  // -------------------------------------------------------------------

  /**
   * Get One
   */
  async getOne(
    options: GetOptions<Type>
  ): Promise<Type | undefined> {
    const strategy = toStrategy(
      options.where,
      this.tableIndex,
      this.tableName
    );
    const timer = Timer();
    let item: Record<string, AttributeValue>;
    let cc: ConsumedCapacity;

    try {
      switch (strategy.type) {
        case TQueryType.tableScan: {
          const result = await this.client.send(
            scanTable<Type>(options, strategy, this.metrics, this.propMap, 1)
          )
          cc = result.ConsumedCapacity || {};
          item = result.Items?.[0];
          break;
        }
        case TQueryType.pkQuery:
        case TQueryType.skQuery: {
          const result = await this.client.send(
            queryTable<Type>(options, strategy, this.metrics, this.propMap, 1)
          );
          cc = result.ConsumedCapacity || {};
          item = result.Items?.[0];
          break;
        }
        case TQueryType.get: {
          const result = await this.client.send(
            getItem<Type>(options, strategy, this.metrics)
          );
          cc = result.ConsumedCapacity || {};
          item = result.Item;
        }
      }

      this.logger({
        message: 'getOne success',
        duration: timer(),
        rcu: cc.CapacityUnits || 0,
        strategy
      });

      return item
        ? toDoc<Type>(item, this.propStack, this.propCount)
        : undefined;
    }
    catch (error) {
      this.logger({
        method: 'getOne failure',
        duration: timer(),
        strategy,
        error
      });
      throw error;
    }
  }

  // -------------------------------------------------------------------

 /**
   * Get Many
   */
  async getMany(
    options: GetOptions<Type>
  ): Promise<Type[]> {
    const strategy = toStrategy(
      options.where,
      this.tableIndex,
      this.tableName
    );
    const timer = Timer();
    let items: Record<string, AttributeValue>[];
    let cc: ConsumedCapacity;
    let limit = 1000;

    try {
      switch (strategy.type) {
        case TQueryType.tableScan: {
          const result = await this.client.send(
            scanTable<Type>(options, strategy, this.metrics, this.propMap, limit)
          )
          cc = result.ConsumedCapacity || {};
          items = result.Items || [];
          break;
        }
        case TQueryType.pkQuery:
        case TQueryType.skQuery:
        case TQueryType.get: {
          const result = await this.client.send(
            queryTable<Type>(options, strategy, this.metrics, this.propMap, limit)
          );
          cc = result.ConsumedCapacity || {};
          items = result.Items || [];
          break;
        }
      }

      this.logger({
        message: 'getMany success',
        duration: timer(),
        rcu: cc.CapacityUnits || 0,
        strategy
      });

      return items.map(item =>
        toDoc<Type>(item, this.propStack, this.propCount)
      );
    }
    catch (error) {
      this.logger({
        method: 'getOne failure',
        duration: timer(),
        strategy,
        error
      });
      throw error;
    }
  }

  /**
   * Delete Documents
   */
  async delete() { }

  // ----------------------------------------------------------------
  //    Public Migration Methods
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
}
