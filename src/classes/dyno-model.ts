import { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb"; // ES Modules import
import { singleton } from 'tsyringe';
import { TBillingMode, TEntityIndex, TEventType, TExpression, TIndex, TModelSchema, TOrder, TProp, TPropMap, TRemovalPolicy, TSubscription } from '@/types';
import { TStrategy, TQueryType, toStrategy } from '@/helpers/to-strategy';
import { toItem } from '@/helpers/to-item';
import { toKeys } from '@/helpers/to-keys';
import { toExpression } from '@/helpers/to-expression';
import { toIndex } from '@/helpers/to-index';
import { Timer } from "@/utils";

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
  private client: DynamoDBClient;
  public tableName: string;
  public tableIndex: TIndex[];
  public propMap: TPropMap;
  public propStack: TProp[];
  private propCount: number;
  private metrics: boolean;
  private subscriptions: TSubscription[];
  public removalPolicy: TRemovalPolicy;
  public billingMode: TBillingMode;
  public entity: Function;

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
    subscriptions
  }: {
    entityName: string; 
    tableName: string; 
    entity: Function;
    index: TEntityIndex[];
    props: TPropMap;
    client: DynamoDBClient;
    removalPolicy: TRemovalPolicy,
    metrics: boolean;
    subscriptions: TSubscription[];
  }) {
    try {
      this.client = client;
      this.tableName = tableName;
      this.metrics = metrics;
      this.entity = entity;
      this.removalPolicy = removalPolicy;
      this.subscriptions = [];
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
   * Broadcast Event
   */
  onEvent(type: TEventType, data: Record<string, any>) {
    for (let i = 0; i < this.subscriptions.length; ++i) {
      const subscription = this.subscriptions[i];

      if (subscription.type === type) {
        subscription.cb(data);
      }
    }
  }

  // -------------------------------------------------------------------
  //                        Public API
  // -------------------------------------------------------------------

  /**
   * Put One
   * 
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/PutItemCommand/
   */
  async putOne(
    doc: Type,
    where?: TExpression<Type>
  ): Promise<Type> { 
    const names = {}, values = {};
    const timer = this.metrics && Timer();

    try {
      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: toItem<Type>(doc, this.propStack),
        ReturnValues: 'NONE',
        ReturnConsumedCapacity: this.metrics ? 'TOTAL' : 'NONE',
        ReturnItemCollectionMetrics: this.metrics ? 'SIZE' : 'NONE',
        ReturnValuesOnConditionCheckFailure: 'NONE',
        ConditionExpression: where
          ? toExpression(where, this.propMap, names, values)
          : undefined,
        ExpressionAttributeNames: where ? names : undefined,
        ExpressionAttributeValues: where ? values : undefined
      });
      const result = await this.client.send(command);

      console.log('PUT_CMD', JSON.stringify(command, null, '  '));
      console.log('PUT_RES', JSON.stringify(result, null, '  '));

      this.onEvent('success', {
        method: 'putOne',
        time: timer(),
        wcu: result.ConsumedCapacity?.CapacityUnits || 0,
      });

      return doc;
    }
    catch (error) {
      this.onEvent('failure', {
        method: 'putOne',
        time: timer(),
        error
      });
      throw error;
    }
  }

  /**
   * Put Many
   * 
   * - TODO: If where, call putOne() for each entry
   * - TODO: Else, call batchPut() for each batch
   */
  // async putMany(docs: Type[], { where }: {
  //   where?: TExpression<Type>
  // }): Promise<Type[]> {
  //   const timer = this.metrics && Timer();

  //   try {
  //     this.onEvent('success', {
  //       method: 'putMany',
  //       time: timer(),
  //       wcu: result.ConsumedCapacity?.CapacityUnits || 0,
  //     });
  //   }
  //   catch (error) {
  //     this.onEvent('failure', {
  //       method: 'putMany',
  //       time: timer(),
  //       error
  //     });
  //     throw error;
  //   }
  // }

  /**
   * Get One
   * 
   * TODO - Get from GSI depending on the keys
   * TODO - Type check for either pk+sk or pk1+sk1
   * 
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/GetItemCommand/
   */
  async getOne(
    options: GetOptions<Type>
  ): Promise<Type | undefined> {
    const strategy = toStrategy(
      options.where,
      this.tableIndex,
      this.tableName
    );

    switch (strategy.type) {
      case TQueryType.tableScan:
        return this.getOneScanTable(options, strategy);
      case TQueryType.pkQuery:
      case TQueryType.skQuery:
        return this.getOneQuery(options, strategy);
      case TQueryType.get:
        return this.getOneGet(options, strategy);
    }
  }

  /**
   * Scan
   */
  async getOneScanTable( 
    options: GetOptions<Type>,
    strategy: TStrategy<Type>,
  ): Promise<Type | undefined> {
    const { consistent, order } = options;
    const { table, index, filter } = strategy;
    const names = {}, values = {};
    const timer = Timer();

    try {
      const command = new QueryCommand({
        TableName: table,
        IndexName: index,
        Select: "ALL_ATTRIBUTES",
        Limit: 1,
        //ExclusiveStartKey: {},
        ReturnConsumedCapacity: this.metrics ? 'TOTAL' : 'NONE',
        FilterExpression: toExpression(filter, this.propMap, names, values),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ConsistentRead: consistent === true,
      });

      const result = await this.client.send(command);

      this.onEvent('success', {
        method: 'getOne',
        time: timer(),
        rcu: result.ConsumedCapacity?.CapacityUnits || 0,
        strategy
      });

      return result.Items
        ? result.Items?.[0] as Type
        : undefined;
    }
    catch (error) {
      this.onEvent('failure', {
        method: 'getOne',
        time: timer(),
        strategy,
        error
      });
      throw error;
    }
  }

  /**
   * Query
   */
  async getOneQuery(
    { consistent, order }: GetOptions<Type>,
    strategy: TStrategy<Type>,
  ): Promise<Type | undefined> {
    const names = {}, values = {};
    const { table, index, filter, query } = strategy;
    const timer = Timer();

    try {
      const command = new QueryCommand({
        TableName: table,
        IndexName: index,
        Select: "ALL_ATTRIBUTES",
        Limit: 1,
        ConsistentRead: consistent === true,
        ScanIndexForward: order !== 'desc',
        //ExclusiveStartKey: { "<keys>": "<AttributeValue>", },
        ReturnConsumedCapacity: this.metrics ? 'TOTAL' : 'NONE',
        FilterExpression: toExpression(filter, this.propMap, names, values),
        KeyConditionExpression: toExpression(query, this.propMap, names, values),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values
      });
     
      const result = await this.client.send(command);

      this.onEvent('success', {
        method: 'getOne',
        time: timer(),
        rcu: result.ConsumedCapacity?.CapacityUnits || 0,
        strategy,
      });

      return result.Items
        ? result.Items?.[0] as Type
        : undefined;
    }
    catch (error) {
      this.onEvent('failure', {
        method: 'getOne',
        time: timer(),
        strategy,
        error
      });
      throw error;
    }
  }

  /**
   * Get
   */
  async getOneGet(
    options: GetOptions<Type>,
    strategy: TStrategy<Type>,
  ): Promise<Type | undefined> {
    const { where, consistent } = options;
    const { table, index, keys, query } = strategy;
    const timer = Timer();

    try {
      const command = new GetItemCommand({
        TableName: index || table,
        Key: toKeys<Type>(keys, query),
        ConsistentRead: consistent === true,
        ReturnConsumedCapacity: this.metrics ? 'TOTAL' : 'NONE'
      });

      const result = await this.client.send(command);

      console.log('GET_CMD', JSON.stringify(command, null, '  '));
      console.log('GET_RES', JSON.stringify(result, null, '  '));

      this.onEvent('success', {
        method: 'getOne',
        time: timer(),
        rcu: result.ConsumedCapacity?.CapacityUnits || 0,
        strategy,
      });

      return result.Item
        ? result.Item as Type
        : undefined;
    }
    catch (error) {
      this.onEvent('failure', {
        method: 'getOne',
        time: timer(),
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
