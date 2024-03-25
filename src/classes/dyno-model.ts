import { PutItemCommand, GetItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb"; // ES Modules import
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { singleton } from 'tsyringe';
import { TBillingMode, TEventType, TExpression, TKeys, TOrder, TProp, TPropMap, TRemovalPolicy, TSubscription } from '@/types';
import { TStrategy, TQueryType, toStrategy } from '@/helpers/to-strategy';
import { toItem } from '@/helpers/to-item';
import { toExpression } from '@/helpers/to-expression';
import { toKeys } from '@/helpers/to-keys';
import { Timer } from "@/utils";

export interface GetOptions<Type> {
  where: TExpression<Type>,
  consistent?: boolean;
  order?: TOrder;
}

/**
 * Dyno Model
 */
@singleton()
export class DynoModel<Type> {
  private client: DynamoDBDocumentClient;
  public tableName: string;
  public tableKeys: string[][];
  public propMap: TPropMap;
  public propStack: TProp[];
  private propCount: number;
  private metrics: boolean;
  private subscriptions: TSubscription[];
  public removalPolicy: TRemovalPolicy;
  public billingMode: TBillingMode;

  /**
   * Constructor
   */
  constructor({
    entityName,
    tableName,
    keys,
    props,
    client,
    removalPolicy,
    billingMode,
    metrics,
    subscriptions
  }: {
    entityName: string; 
    tableName: string; 
    keys: TKeys[];
    props: TPropMap;
    client: DynamoDBDocumentClient;
    removalPolicy: TRemovalPolicy,
    billingMode: TBillingMode,
    metrics: boolean;
    subscriptions: TSubscription[];
  }) {
    try {
      this.client = client;
      this.tableName = tableName;
      this.metrics = metrics;
      this.removalPolicy = removalPolicy;
      this.billingMode = billingMode;
      this.tableKeys = [];
      this.subscriptions = [];
      this.propMap = props;
      this.propStack = [...props.values()];
      this.propCount = props.size;
      this.tableKeys = toKeys(keys, this.propStack);
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
      this.tableKeys,
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
    const { table, index } = strategy;
    const timer = Timer();

    try {
      const command = new GetItemCommand({
        TableName: index || table,
        Key: toItem<Type>(where as Partial<Type>, this.propStack),
        ConsistentRead: consistent === true,
        ReturnConsumedCapacity: this.metrics ? 'TOTAL' : 'NONE'
      });
      const result = await this.client.send(command);

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
   * Get DynamoDb Table Definition
   */
  toTable() {
    const [pk, sk] = this.tableKeys[0];

    return {
      tableName: this.tableName,
      removalPolicy: this.removalPolicy,
      billingMode: this.billingMode,
      partitionKey: {
        name: 'pk',
        type: this.propMap.get(pk)?.token || 'S'
      },
      sortKey: {
        name: 'sk',
        type: this.propMap.get(sk)?.token || 'S'
      },
      timeToLiveAttribute: 'ttl'
    };
  }

  /**
   * Get DynamoDb Index Definitions
   */
  toIndices() {
    const indices = this.tableKeys.slice(1);
    
    return indices.map(([pk, sk], i) => ({
      indexName: `${this.tableName}-gsi-${i + 1}`,
      partitionKey: {
        name: `pk${i + 1}`,
        type: this.propMap.get(pk)?.token || 'S'
      },
      sortKey: {
        name: `sk${i + 1}`,
        type: this.propMap.get(sk)?.token || 'S'
      },
      projectionType: 'ALL'
    }));
  }
}
