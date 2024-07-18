import { BatchWriteItemCommandOutput, WriteRequest } from "@aws-sdk/client-dynamodb";

// Error Object
// {
//   code: 'ValidationException',
//   time: 2022-03-20T03:12:46.039Z,
//   requestId: '1PCVHRVC86FOMN8A7UVNH2480RVV4KQNSO5AEMVJF66Q9ASUAAJG',
//   statusCode: 400,
//   retryable: false,
//   retryDelay: 11.4561398533365
// }

// ----------------------------------------------------------------------
//                                 Types
// ----------------------------------------------------------------------

export interface TDbError {
  message: string;
  code: string;
  statusCode: number;
  retryable: boolean;
  retryDelay: number;
}

export type TTableRequest = {
  [key: string]: WriteRequest;
}

// ----------------------------------------------------------------------
//                               Functions
// ----------------------------------------------------------------------

/**
 * Convert Error to simpler error object
 */
export function toError(
  error: any
): TDbError {
  let message = error.message;

  if (message.length > 100) {
    message = message.replace(/Value '.*?' at/, '...');

    if (message.length > 100) {
      message = message.substr(0, 100);
    }
  }
  return {
    message: message,
    code: error.code,
    statusCode: error.statusCode,
    retryable: error.retryable,
    retryDelay: error.retryDelay
  };
}

/**
 * Extract retry ids from results as a set
 */
export function toRetryIds(
  results: BatchWriteItemCommandOutput
): Set<string> {
  const tables = results.UnprocessedItems || {};
  const requests = Object.values(tables)[0] || [];

  return requests.reduce((retryIds, request) =>
    retryIds.add(toRequestId(request)),
    new Set<string>()
  );
}

/**
 * Extract partition & sort key from request
 */
export function toRequestId(
  request: WriteRequest
): string {
  const Item = request.PutRequest?.Item
    || request.DeleteRequest?.Key
    || {};
  return (Object.values(Item.pk || {})[0] || '?')
    + '|'
    + (Object.values(Item.sk || {})[0] || '?')
}

/**
 * Extract the consumed capacity units from a batch write
 */
export function toCapacityUnits(
  results: BatchWriteItemCommandOutput
): number {
  return results.ConsumedCapacity?.reduce((sum, entry) =>
    sum + (entry?.CapacityUnits || 0),
    0
  ) || 0;
}

