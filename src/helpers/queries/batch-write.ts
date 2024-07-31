import { BatchWriteItemCommand, BatchWriteItemCommandOutput, DynamoDBClient, WriteRequest } from "@aws-sdk/client-dynamodb";
import { toError, TDbError, toRetryIds, toCapacityUnits, toRequestId } from './batch-utils';
import { Timer, TTimer } from '../../utils';

// ----------------------------------------------------------------------
//                                Types
// ----------------------------------------------------------------------

export interface TBatch {
  id: number;
  status: TBatchStatus;
  requests: number;
  duration: number;
  retryable: number;
  wcu: number;
}

export interface TBatchResults {
  saved: string[][];
  failed: string[][];
  errors: TDbError[];
  batches: TBatch[];
  retries: number;
}

export enum TBatchStatus {
  started = 'started',
  success = 'success',
  failed = 'failed'
}

export enum TState {
  active = 'active',
  blocked = 'blocked',
  finished = 'finished'
}

export interface TAction {
  to: TState,
  action: Function
}

export type TStates = Record<TState, Record<TState, TAction>>;

// ----------------------------------------------------------------------
//                              BatchMap
// ----------------------------------------------------------------------

/**
 * BatchMap an array to callback
 * - callback to return failed entries
 * - Backoff steps: 50, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 102400
 */
export function BatchWrite<EntityType>(
  {
    client,
    tableName,
    writeRequests,
    batchSize = 25,
    concurrency = 3,
    maxBackoff = 60 * 1000,
    retryBackoff = 50
  }: {
    client: DynamoDBClient;
    tableName: string;
    writeRequests: WriteRequest[];
    batchSize?: number,
    concurrency?: number;
    maxBackoff?: number;
    retryBackoff?: number;
  }
): Promise<TBatchResults> {
  return new Promise<TBatchResults>(resolve => {
    let queue = writeRequests.slice();
    let state = TState.active;

    let saved: string[] = [];
    let failed: string[] = [];
    let errors: TDbError[] = [];
    let batches: TBatch[] = [];

    let batchCount = 0;
    let retryIn = 0;
    let retries = 0;
    let active = 0;
    let wcu = 0;

    /**
     * Finite State Machine
     */
    const STATE_FSM: TStates = {
      active: {
        active: { to: TState.active, action: onBatch },
        blocked: { to: TState.blocked, action: onBlock },
        finished: { to: TState.finished, action: onFinish }
      },
      blocked: {
        active: { to: TState.active, action: onBatch },
        blocked: { to: TState.blocked, action: onIgnore },
        finished: { to: TState.finished, action: onFinish }
      },
      finished: {
        active: { to: TState.finished, action: onFinish },
        blocked: { to: TState.finished, action: onFinish },
        finished: { to: TState.finished, action: onFinish }
      }
    };

    /**
     * Decide what to do next
     */
    function onNext(nextState: TState) {
      const { to, action } = STATE_FSM[state][nextState];
      action(state = to);
    }

    /**
     * Block batch operations
     */
    function onBlock() {
      retries++; 

      retryIn = retryIn
        ? retryIn * 2
        : retryBackoff;
        
      if (retryIn > maxBackoff) {
        errors.push({
          message: `Too many retry attempts: ${retries}`,
          code: 'RetryLimitExceeded',
          statusCode: 400,
          retryable: true,
          retryDelay: retryIn
        });
        return onNext(TState.finished);
      }
      setTimeout(
        () => onNext(TState.active),
        retryIn
      );
    }

    /**
     * Ignore batch operations
     */
    function onIgnore() { }

    /**
     * Send a batch to DynamoDB
     */
    function onBatch() {
      while (active < concurrency
        && queue.length
      ) {
        const requests = queue.splice(0, batchSize);
        const batch = {
          id: ++batchCount,
          status: TBatchStatus.started,
          requests: requests.length,
          retryable: 0,
          duration: 0,
          wcu: 0
        };
        const timer = Timer();
        batches.push(batch);
        active++;

        client.send(
          new BatchWriteItemCommand({
            ReturnConsumedCapacity: 'TOTAL',
            ReturnItemCollectionMetrics: 'SIZE',
            RequestItems: {
              [tableName]: requests
            }
          })
        ).then(
          results => onSuccess(results, requests, batch, timer),
          error => onFailure(error, requests, batch, timer)
        );
      }
      if (!active && !queue.length) {
        onNext(TState.finished);
      }
    }

    /**
     * Process a successful batch request
     */
    function onSuccess(
      results: BatchWriteItemCommandOutput,
      requests: WriteRequest[],
      batch: TBatch,
      timer: TTimer
    ) {
      const retryIds = toRetryIds(results);

      requests.forEach(request => {
        const requestId = toRequestId(request);

        retryIds.has(requestId)
          ? queue.push(request)
          : saved.push(requestId);
      });

      batch.duration = timer();
      batch.status = TBatchStatus.success;
      batch.wcu = toCapacityUnits(results);
      batch.retryable = retryIds.size;

      wcu += batch.wcu;
      active--;

      onNext(retryIds.size
        ? TState.blocked
        : state
      );
    }

    /**
     * Process a failed batch request
     */
    function onFailure(
      dbError: any,
      requests: WriteRequest[],
      batch: TBatch,
      timer: TTimer
    ) {
      requests.forEach(request =>
        dbError.retryable
          ? queue.push(request)
          : failed.push(toRequestId(request))
      )
      errors.push(toError(dbError));

      batch.duration = timer();
      batch.status = TBatchStatus.failed;
      batch.retryable = dbError.retryable
        ? requests.length
        : 0;
      
      active--;
      
      onNext(dbError.retryable
        ? TState.blocked
        : state
      );
    }
   
    /**
     * Finish batch operation
     */
    function onFinish() {
      if (!active) {
        queue.forEach(request =>
          failed.push(toRequestId(request))
        );
        resolve({
          saved: saved.map(key => key.split('|')),
          failed: failed.map(key => key.split('|')),
          errors,
          retries,
          batches
        });
      }
    }

    // prime the pump
    onNext(state);
  });
}
