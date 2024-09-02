import { TBatchItems, TIndex, TItem } from '@/types';
import { BatchGetItemCommand, BatchGetItemCommandOutput, DynamoDBClient, KeysAndAttributes } from "@aws-sdk/client-dynamodb";
import { toError, TDbError, toCapacityUnits, toRequestId, splitBatch, countBatch } from './batch-utils';
import { Timer, TTimer } from '../../utils';
import { toBatchKeys } from "../marshall/to-batch-keys";

// ----------------------------------------------------------------------
//                                Types
// ----------------------------------------------------------------------

export interface TBatch {
  id: number;
  status: TBatchStatus;
  duration: number;
  retryable: number;
  rcu: number;
}

export interface TBatchResults {
  results: TItem[];
  failed: TItem[];
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

export type TKeys = Record<string, KeysAndAttributes>

// ----------------------------------------------------------------------
//                              BatchMap
// ----------------------------------------------------------------------

/**
 * BatchMap an array to callback
 * - callback to return failed entries
 * - Backoff steps: 50, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 102400
 */
export function BatchGet<EntityType>(
  {
    client,
    docKeys,
    tableIndex,
    batchSize = 100,
    concurrency = 3,
    maxBackoff = 60 * 1000,
    retryBackoff = 50
  }: {
    client: DynamoDBClient;
    docKeys: Partial<EntityType>[];
    tableIndex: TIndex[],
    batchSize?: number,
    concurrency?: number;
    maxBackoff?: number;
    retryBackoff?: number;
  }
): Promise<TBatchResults> {
  return new Promise<TBatchResults>(resolve => {
    let queue = splitBatch(docKeys, batchSize)
      .map(batch => toBatchKeys(batch, tableIndex));
    
    let state = TState.active;

    let results: TItem[] = [];
    let failed: TItem[] = [];
    let errors: TDbError[] = [];
    let batches: TBatch[] = [];

    let batchCount = 0;
    let retryIn = 0;
    let retries = 0;
    let active = 0;
    let rcu = 0;

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
        const requestItems = queue.pop();

        const batch = {
          id: ++batchCount,
          status: TBatchStatus.started,
          retryable: 0,
          duration: 0,
          rcu: 0
        };
        const timer = Timer();
        batches.push(batch);
        active++;

        client.send(
          new BatchGetItemCommand({
            ReturnConsumedCapacity: 'TOTAL',
            RequestItems: requestItems
          })
        ).then(
          results => onSuccess(results, batch, timer),
          error => onFailure(error, requestItems, batch, timer)
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
      output: BatchGetItemCommandOutput,
      batch: TBatch,
      timer: TTimer
    ) {
      const count = countBatch(output.UnprocessedKeys);

      if (count) {
        queue.push(output.UnprocessedKeys);
      }
      if (output.Responses) {
        Object.values(output.Responses).forEach(list =>
          results = results.concat(list)
        )
      }
      batch.duration = timer();
      batch.status = TBatchStatus.success;
      batch.rcu = toCapacityUnits(output);
      batch.retryable = count;

      rcu += batch.rcu;
      active--;

      onNext(count
        ? TState.blocked
        : state
      );
    }

    /**
     * Process a failed batch request
     */
    function onFailure(
      dbError: any,
      requests: TBatchItems,
      batch: TBatch,
      timer: TTimer
    ) {
      const count = countBatch(requests);

      if (dbError.retryable) {
        queue.push(requests);
      }
      else {
        Object.values(requests).forEach(entry =>
          failed = failed.concat(entry.Keys)
        );
      }
      errors.push(toError(dbError));

      batch.duration = timer();
      batch.status = TBatchStatus.failed;
      batch.retryable = count;
      
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
          Object.values(request).forEach(entry =>
            failed = failed.concat(entry.Keys)
          )
        );
        resolve({
          results,
          failed,
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
