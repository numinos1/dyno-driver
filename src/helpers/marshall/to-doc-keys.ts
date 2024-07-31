import { TProp, TIndex, TPropTokens } from '@/types';

/**
 * Convert Array of Item keys to Document prop
 */
export function toDocKeys<Type>(
  keys: string[],
  index: TIndex
): Partial<Type> {
  return fromKey(
    keys[1],
    index.sk,
    fromKey(
      keys[0],
      index.pk,
      {}
    )
  );
}

/**
 * Convert an Item key to a Document prop
 */
export function fromKey<Type>(
  key: string,
  prop: TProp,
  doc: Partial<Type>
) {
  if (!prop.isStatic) {
    let value: string | number | Buffer = key;

    if (prop.prefix) {
      value = value.substring(prop.prefix.length);
    }
    if (prop.type === TPropTokens.number) {
      value = parseInt(value, 10);
    }
    else if (prop.type === TPropTokens.binary) {
      value = Buffer.from(value, 'utf-8');
    }
    doc[prop.name] = value;
  }
  return doc;
}
