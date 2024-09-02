import { TBatchItems, TIndex, TItem } from './../../types';
import { toItemAttr } from "./to-item-attr";
import { AttributeValue, KeysAndAttributes } from '@aws-sdk/client-dynamodb';



/**
 * Convert an array of doc keys to Batch Read Keys
 */
export function toBatchKeys<Type>(
  docs: Partial<Type>[],
  tableKeys: TIndex[], // Array of table keys
): TBatchItems {
  const RequestItems: TBatchItems = {};
  const searchKeys = sortIndex(tableKeys);
  const searchLength = searchKeys.length;

  for (let docIndex = 0; docIndex < docs.length; ++docIndex) {
    const doc = docs[docIndex];
    let searchIndex = 0;
    
    while (searchIndex < searchLength) {
      const { pk, sk, name } = searchKeys[searchIndex];
      const pkVal = pk.isStatic ? '' : doc[pk.name];
      const skVal = sk.isStatic ? '' : doc[sk.name];

      if (pkVal !== undefined && skVal !== undefined) {
        const itemKeys: TItem = {
          [pk.alias]: toItemAttr(pkVal, pk.type, pk.prefix),
          [sk.alias]: toItemAttr(skVal, sk.type, sk.prefix)
        };
        let items = RequestItems[name];

        if (items?.Keys) {
          items.Keys.push(itemKeys);
        }
        else {
          RequestItems[name] = { Keys: [itemKeys] };
        }
        break;
      }
      searchIndex++;
    }
    if (searchIndex === searchLength) {
      throw new Error(`BatchGet doc missing keys: ${JSON.stringify(doc)}`);
    }
  }
  return RequestItems;
}

/**
 * Sort Table Index
 * (Prioritize indices without static keys)
 * (Consider secondary sort on index in array)
 */
function sortIndex(
  tableIndex: TIndex[]
): TIndex[] {
  return tableIndex.sort((a, b) => {
    const aVal = (a.pk.isStatic ? 0 : 1)
      + (a.sk.isStatic ? 0 : 1);
    const bVal = (b.pk.isStatic ? 0 : 1)
      + (b.sk.isStatic ? 0 : 1);
    return (bVal - aVal);
  });
}