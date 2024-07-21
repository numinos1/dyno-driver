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

export interface GetOneOptions<T> {
  where: TExpression<T>,
  consistent?: boolean;
  order?: TOrder;
}

export interface GetManyOptions<T> {
  where: TExpression<T>,
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
  public tableIndex: TIndex[];
  public propMap: TPropMap;
  public propStack: TProp[];
  public propCount: number;
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
    index: TEntityIndex[];
    props: TPropMap;
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
      this.propStack = [...props.values()];
      this.propCount = props.size;
      this.tableIndex = toIndex(index, this.propStack);
    }
    catch (err) {
      err.message = `Entity "${entityName}" ${err.message}`;
      throw err;
    }
  }

  /**
   * Unmarshall Document
   */
  unmarshall(doc: TItem | undefined): Type | undefined {
    return doc
      ? toDoc<Type>(doc, this.propStack, this.propCount)
      : undefined;
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

    // TODO - Return processed results
    // TODO - ids need to be correlated to input docs
    // TODO - Return an array of status' in the order of the inputs
    return {
      duration: timer(),
      cost: results.batches.reduce((wcu, batch) => wcu + batch.wcu, 0),
      results,
      docs
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
          command: command.input
        };
      }
      case TQueryType.getItem: {
        const command = getItem<Type>(
          options,
          strategy,
          this.metrics
        );
        const result = await this.client.send(command);

        return {
          duration: timer(),
          cost: result.ConsumedCapacity.CapacityUnits || 0,
          doc: this.unmarshall(result.Item),
          strategy: TQueryType[strategy.type],
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
        const command: QueryCommand = scanTable<Type>(
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
          command: command.input
        };
      }
    }
  }

  // -------------------------------------------------------------------
  //      Delete
  // -------------------------------------------------------------------

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
